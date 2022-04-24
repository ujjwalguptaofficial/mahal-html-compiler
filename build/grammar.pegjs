{
 const CTX = "ctx";
 const handleHtmlOpen = (word,option)=>{
   const result = {
     tag:word || 'fragment',
     events:[],
     attr:[],
     dir:{}
  }
  option.forEach(val=>{
    const key = val?Object.keys(val)[0]:null;
    switch(key){
      case 'event':
        result.events.push(val[key]);break;
      case 'attr':
        result.attr.push(val[key]);break;
       case 'dir':
         const dirValue = val[key];
         result.dir[dirValue.name]=dirValue.value;
         break;
      case null:
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
}
HtmlTag = HtmlTagClosing/HtmlTagSelfClosing/HtmlComment/HtmlPreTag

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


HtmlTagClosing = openTag:HtmlOpen GtSymbol child:(HtmlTag/Html/MustacheExpression)* closeTag:CloseTag {
 const openTagValue = openTag.tag;
 if (openTagValue != closeTag) {
        error("Expected </" + openTagValue + "> but </" + closeTag + "> found.");
  }
  return {
   view:openTag,
   child: child.filter(item=> {
      return item!=null && typeof item==='string'?item.trim().length!==0:true
   })
  }
}

HtmlTagSelfClosing = openTag:HtmlOpenSelfClosing "/" GtSymbol {
  return {
    view:openTag,
    child:[]
  }
}

HtmlOpenSelfClosing = LtSymbol word: XmlTag  option:(HtmlOpenOption)* {
 return handleHtmlOpen(word,option);
}

HtmlOpen = LtSymbol word: XmlTag?  option:(HtmlOpenOption)* {
 return handleHtmlOpen(word,option);
}

HtmlPreTag = LtSymbol "pre"  option:(HtmlOpenOption)* GtSymbol content:( !"</pre>" c:. {return c})* "</pre>" {
 return {
   view: handleHtmlOpen("pre",option),
   child: [content.join('')]
  }
}

HtmlOpenOption = value:((If/ElseIf/Else)/For/(Event)/Attribute/Directive/NewLine/_)  _* {
  if(value==null){
    return null;
  }
  
  const key = Object.keys(value)[0];
  return {
     [key]:value[key]
  }
}

CloseTag "close tag"= StartCloseTag word: XmlTag? GtSymbol{
  return word || 'fragment'
}


XmlTag "html tag" = !"pre" val:[a-zA-Z0-9-_]+ {
  return val.join("");
}


Ws "Whitespace" = [ \t];
NewLine "New Line" = [\n]+ {return null;}

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

For = ":for("_* key:Identifier _* index:ForIndex?  _* "in" _* value:Expression _* ")"{
   return {forExp:{
      key, value,index : index || 'i'
   }}
}

SimpleAttribute = attr:Identifier _* word:SimpleAttributeAssignment? _* {
   return {attr: {key:`'${attr}'`,value:word||''}};
}

SimpleAttributeAssignment = "=" StringSymbol word: AttributeValue? StringSymbol {
  return word;
}

ExpressionAttribute = ":" attr:Identifier _* "=" StringSymbol word:Expression filters:Filter* _* StringSymbol _*{
   return { 
      attr: {key:`'${attr}'`,value:word, isExpression:true, filters}
   };
}

Attribute= SimpleAttribute/ExpressionAttribute ;

ForIndex = "," _* index:Identifier{
	return index ;
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

EventHandler = handler:EventAssignment {
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

ExpressionValue = val : AnyValue _*{
  if(val.expStr){
    return val;
  }
  if(val.__isProp__){
    return {keys:[val.pre + val.value], raw: val.pre + val.value, expStr: val.pre + "ctx." + val.value}
  }
  return {keys:[],raw:val,expStr:val}
}

ExpressionRightSide = op:ComparisionAndArithmeticOperator _* val:ExpressionValue {
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

ComparisionAndArithmeticOperator "comparision operator or arithmetic operator" = val:[>\=\<\!\+\-\*\/\\]+ {
  return val.join("");
}

ExpWord "expression" = val:[a-zA-Z0-9\.\$\-\'\"]+ {
	return val.join("");
}

EventAssignment "Event Assignment"= val:(EventAssignment1/EventAssignment2) {
  const openPar = val.match(/[(]/g);
  if(openPar && !val.match(/=>/g)){
   return `()=> ${val}`;
  }
  return val;
}

EventAssignment1 = '"' val:(!'"' c:. {return c})+ '"' {
	return val.join("");
}

EventAssignment2 = "'" val:(!"'" c:. {return c})+ "'" {
	return val.join("");
}



/*Html "html"= val: [^<>{}]+ {
	return val.join("").replace(/[\n\r]/gm, "").replace(/\s\s+/g, ' ');
}*/

Html "html"=  val:(!"<" !">" !"{{" !"}}" c:. {return c})+ {
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

Word "word" = val:[a-zA-Z0-9\&\ \|\.\$\!\=\-\:\;\#\/\\%\_\@]+ {
	return val.join("");
}

AttributeValue "attribute value" = val:(!"'" !'"' c:. {return c})+ {
  return val.join("");
}

Boolean "boolean" = val:("true" / "false") {
  return val=="true"?true:false;
}

Number "number" = val:[0-9]+ {
   return Number(val.join(""));
}

Everything = val: (c:. {return c})*{
  return val.join('')
}

String "string" = pre:"!"? StringSymbol val:(!"'" !'"' c:. {return c})+ StringSymbol {
   return `'${pre||''}${val.join("")}'`;
}

ArrayPropPart = "[" val:(PrimitiveValue) "]" {
 if(val.__isProp__) return error("Component prop are not supported in html, please use Computed.");
 return "[" + val + "]";
}

Prop "prop" = pre:"!"? val:Identifier arrayProps:ArrayPropPart* {
  return {
    __isProp__:true,
    value: val + arrayProps.join(""),
    pre: pre||''
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
