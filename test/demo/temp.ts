(function anonymous(
) {
    var str = `const ctx = this;
    const ce = renderer.createElement;
    const ct = renderer.createTextNode;
    const f = renderer.format;
    const he = renderer.runExp;
    return ce('div', [...he(const m = (item, __i__, returnKey) => {
        const option = {
            attr: {
                'class': {
                    v: 'fruit'
                },
                'fruit': {
                    v: item,
                    k: null
                }
            }
        };
        option.attr = option.attr || {};
        if (!option.attr.key) {
            option.attr.key = {
                v: __i__
            }
        }
        return returnKey ? option.attr.key.v : (() => {
            const dep = {};
            const _el_ = ce('Fruit', [ce('div', [he(() => {
                const method = () => {
                    return ct(item)
                };
                const el = method();
                dep['item'] = [el, method];
                return el;
            }, [])], {})], option);
            // stands for reactive child
            _el_._rc_ = dep;
            // stands for for value
            _el_._fv_ = 'item';
            _el_._fi_ = '__i__';
            return _el_;
        })()
    
    }; m.name = '';m, ['fruits'], 'for')], {})` ; new Function(str)
})