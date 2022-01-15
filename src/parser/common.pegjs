{
 const CTX = "ctx";
}
HtmlTag = HtmlTagClosing/HtmlTagSelfClosing/HtmlComment

HtmlComment = HtmlCommentStart word:CommentContent  "-->" {
  return {
    view:{
       tag:null,
       events:[],
       attr:[]
    },
    child:[word]
  }
}

HtmlCommentStart "<!--" = "<!--"


CommentContent "comment content" = word: (!"-->" c:. {return c})* {
 return word.join('')
}



HtmlTagClosing = openTag:HtmlOpen GtSymbol child:(HtmlTag/Html/MustacheExpression)* CloseTag {
  return {
   view:openTag,
   child: child.filter(item=> {
      return item!=null && typeof item==='string'?item.trim().length!==0:true
   })
  }
}

HtmlTagSelfClosing = openTag:HtmlOpen "/" GtSymbol {
  return {
    view:openTag
  }
}

HtmlOpen = LtSymbol word: XmlTag? _* option:(HtmlOpenOption)* {
  const result = {
     tag:word || 'fragment',
     events:[],
     attr:[],
     dir:{}
  }
  option.forEach(val=>{
    const key = Object.keys(val)[0];
    switch(key){
      case 'event':
        result.events.push(val[key]);break;
      case 'attr':
        result.attr.push(val[key]);break;
       case 'dir':
         const dirValue = val[key];
         result.dir[dirValue.name]=dirValue.value;
         break;
      default:
        result[key] = val[key]   
    }
  });
  if(Object.keys(result.dir).length===0){
     delete result.dir;
  }
 return result;
}

HtmlOpenOption = value:((If/ElseIf/Else)/For/(Event)/Attribute/InnerHtml/Directive) _* {
  const key = Object.keys(value)[0];
  return {
     [key]:value[key]
  }
}

CloseTag "close tag"= StartCloseTag word: XmlTag? GtSymbol{
  return word || 'fragment'
}

XmlTag "html tag" = val:[a-zA-Z0-9-_]+ {
  return val.join("");
}


Ws "Whitespace" = [ \t];

_ "One or more whitespaces" = space:Ws+ {return null;}

Directive "directive" = ":" name:Word value:DirectiveValue? {
   return {dir:{
      name,
      value: value || []
   }};
}

DirectiveValue = "(" expFirst:DirectiveParam _* expRest:DirectiveRestValue * ")" {
   return [expFirst].concat(expRest.map(item=> item))
}


DirectiveRestValue =  "," _* exp:DirectiveParam _*  {
  return exp;
}

DirectiveParam = Expression

If= ":if(" exp:Expression ")"{
   return {ifExp: {ifCond:exp}};
}

ElseIf= ":else-if(" exp:Expression ")"{
   return {ifExp: {elseIfCond:exp}};
}
Else= ":else"{
   return {ifExp: {else:true}}
}

For= ":for("_* key:Identifier _* index:ForIndex?  _* "in" _* value:Expression _* ")"{
   return {forExp:{
      key, value,index : index || 'i'
   }}
}

SimpleAttribute = attr:Identifier _* "=" StringSymbol word: Word StringSymbol _*{
   return {attr: {key:attr,value:word, isBind:false}};
}

ExpressionAttribute = isExpression:":" attr:Identifier _* "=" StringSymbol word:Expression StringSymbol _*{
   return { 
      attr: {key:attr,value:word, isExpression:true}
   };
}

Attribute= SimpleAttribute/ExpressionAttribute ;

ForIndex = "," _* index:Identifier{
	return index ;
}

InnerHtml= ":html" _* "=" StringSymbol? val:Identifier StringSymbol? {
   return {html: val};
}

LtSymbol "<" = [<];

StartCloseTag "</" = LtSymbol [/]; 

GtSymbol ">" = [>];



MustacheExpression "mustache expression" = "{{"_* val:Expression filters:Filter* _*  "}}"+ {
	return {mustacheExp:val , filters};
}

MustacheContent "mustache content"= val:[^|}{]+ {
	return val.join("").replace(/[\n\r]/gm, "").replace(/\s\s+/g, ' ');
}

Filter "filter" = _* "|" _* val:Identifier {
  return val;
}

Event "event syntax" = ("on:"/"@") event:Identifier modifier:EventModifier* "=" handlers:EventHandlers {
	 let isNative=false;
     const option = {};
     const modifierFiltered = [];
     modifier.forEach(item=>{
       if(["capture","once","passive"].includes(item)){
         option[item]=true
       }
       else if(item==="native"){
         isNative=true
       }
       else {
         modifierFiltered.push(item)
       }
     });
    return {event: {name:event, handlers,option, isNative,modifiers:modifierFiltered }};
}

EventHandlers = ev:(EventHandler/EventHandlersChanined){
  return Array.isArray(ev)? ev: [ev]
}

EventHandlersChanined = "{" _* ev1:EventHandler evRest:EventHandlerWithPipe* _* "}" {
   evRest.unshift(ev1);
   return evRest;
}

EventHandlerWithPipe = _* "|" _* ev: EventHandler{
  return ev;
}

EventHandler = StringSymbol handler:EventAssignment StringSymbol {
  return handler
}

EventModifier "event modifier" = "."  value:Identifier {
  return value;
}

Expression = exp1:SingleExpression expn:MultipleExpression* {
   expn.forEach(exp=>{
     exp1.raw += exp.raw? exp.raw : "";
     exp1.expStr += exp.expStr;
     exp1.keys=exp1.keys.concat(exp.keys)
   });
   exp1.keys = Array.from(new Set(exp1.keys));
   return exp1;
}

ExpressionValue = val : AnyValue {
  if(val.expStr){
    return val;
  }
  if(val.__isProp__){
    return {keys:[val.value], raw: val.value, expStr: "ctx." + val.value}
  }
  return {keys:[],raw:val,expStr:val}
}

ExpressionRightSide = op:Operator val:ExpressionValue {
 return {op,val}
}

SingleExpression = left:ExpressionValue right_op:ExpressionRightSide?  {
  
     const result = {expStr:"",keys:[],raw:""};
     let keys = left.keys;
     let expStr=left.expStr;
     let raw = left.raw
     
     if(right_op){
       const op = right_op.op;
       expStr+= op;
       raw+=op;
       const right = right_op.val;
       expStr+= right.expStr;
       raw+= right.raw;
       keys = [...keys,...right.keys]
     }
     return  {expStr,keys,raw};
}

MultipleExpression = _* op:Connector _* exp:SingleExpression {
  exp.raw=` ${op} ${exp.raw}`;
  exp.expStr=` ${op} ${exp.expStr}`
  return exp;
} 

Connector = val:([&]/"||"/"+"/"-"/"*")+ {
  return val.join("");
}

Operator = val:[>\=\<\!\+\-\*\/\\]+ {
  return val.join("");
}

ExpWord "expression" = val:[a-zA-Z0-9\.\$\-\'\"]+ {
	return val.join("");
}

EventAssignment "Event Assignment"= val:[a-zA-Z0-9\&\=\>\{\}\(\)\ \|\[\]\,\.]+ {
	return val.join("");
}

Html "html"= val: [^<>{}]+ {
	return val.join("").replace(/[\n\r]/gm, "").replace(/\s\s+/g, ' ');
}

StringSymbol "' or \" " = ['/"]

AnyValue = PrimitiveValue/ObjectValue

ObjectValue = "{" exp:ObjectOneKeyVal _* expRest:ObjectValueRest* "}" {
   let keys = exp.keys;
   let raw = exp.raw;
   let expStr=exp.expStr;
   
   expRest.forEach(item=>{
      expStr+= ","+item.expStr;
      raw+= ","+item.raw;
      keys=[...keys,...item.keys]
   });
   return {keys,raw:`{${raw}}`,expStr:`{${expStr}}`};
   return exp;
}

ObjectValueRest = _* "," exp:ObjectOneKeyVal {
  return exp;
}

ObjectKeyWithQuote = StringSymbol val:Identifier StringSymbol {
  return `'${val}'`;
}

ObjectOneKeyVal = _* key: (ObjectKeyWithQuote/Identifier) _* ":" _* val:(Expression/PrimitiveValue) {
  //key = `'${key}'`;
  val.expStr=`${key}:${val.expStr}`;
  val.raw=`${key}:${val.raw}`
  return val;
  //return {[key]:val};
}

PrimitiveValue = Number/String/Boolean/Prop ;

Word "word" = val:[a-zA-Z0-9\&\ \|\.\$\!\=\-\:\;\#]+ {
	return val.join("");
}

Boolean "boolean" = val:("true" / "false") {
  return val=="true"?true:false;
}

Number "number" = val:[0-9]+ {
   return Number(val.join(""));
}

String "string" = StringSymbol val:[a-zA-Z0-9\&\ \.\$\!\=\-\:\;\#]+ StringSymbol {
   return `'${val.join("")}'`;
}

Prop "prop" = val:Identifier {
  return {
    __isProp__:true,
    value:val
  }
}

IdentifierAlphabet = val:[a-zA-Z\$\_\-\.]+ {
 return val.join("");
}

IdentifierPartial = val1:IdentifierAlphabet val2:Number? {
    return val2!=null ? val1+val2 : val1;
}

Identifier "identifier" = val:IdentifierPartial + {
    return val.join("");
}
