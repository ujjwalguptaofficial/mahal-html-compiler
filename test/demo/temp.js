(function anonymous(
    ) {
    const ctx = this;
    const ce = renderer.createElement;
    const ct = renderer.createTextNode;
    const f = renderer.format;
    const he = renderer.runExp;
    return ce('div', [...he((fruit, i) => {
            return ce('div', [ce('div', [ce('input', [], {
                dir: {
                    model: {
                        get value() {
                            return [fruit]
                        },
                        set value(values) {
                            fruit = values[0];
                        },
                        props: [],
                        params: [fruit]
                    }
                },
                attr: {
                    'type': {
                        v: 'text'
                    }
                }
            }), ce('span', [he(() => {
                return ct(fruit)
            }, [], 9)], {})], {}), ce('button', [ct("Update")], {
                on: {
                    click: {
                        handlers: [() => {
                            ctx.updateFruit(fruit, i)
                        }],
                        isNative: false,
                        option: {},
                        modifiers: []
                    }
                }
            })], {
                attr: {
                    'class': {
                        v: 'fruit-row'
                    }
                }
            })
        }
    },
    ['fruits'], 'for')], {})
    })