import { createRenderer } from "@mahaljs/html-compiler";
import { expect } from "chai";
import { createComponent } from "./create_component";
import { mount } from "@mahaljs/test-utils";


describe('simple', function () {
    it('div with mustache expression', () => {
        createRenderer(`<div>{{ujjwal}}</div>`)
    })

    it('div with mustache expression and space', () => {
        createRenderer(`<div>{{ ujjwal }}</div>`)
    })

    it('div with mustache expression', () => {
        createRenderer(`<div>{{ujjwal + "as" + 1}}</div>`)
    })

    it('div with simple inner text', () => {
        createRenderer(`<div>ujjwal</div>`)
    })

    it('div with unclosed tag', () => {
        try {
            createRenderer(`<div>`);
        } catch (error) {
            expect(error.message).to.be.equal(`Expected <, <!--, close tag, html, or mustache expression but end of input found.`)
        }
        // new Promise(() => {
        //     createRenderer(`<div>`)
        // }).then(done).catch(() => {
        //     done();
        // });
    })

    it('div with self closing tag', () => {
        createRenderer(`<div/>`);
    })

    it('multiple parent', (done) => {
        new Promise(() => {
            createRenderer(`<div></div><div></div>`);

        }).catch(() => {
            done();
        });
    })

    it('multiline', () => {
        createRenderer(`<div>
          <div>Ujjwal</div>
        </div>`);
    })

    it('bind value', () => {
        createRenderer(`<div>
        Standard Text box
           <input type="text" :value="value" on:input="onInput" />
        </div>`);
    })

    it('model', () => {
        createRenderer(`<div>
        <input type="text" :model(text) />
     </div>`);
    })

    it('tag with "-"', () => {
        createRenderer(`<div>
        <in-place of="name" />
     </div>`);
    })

    it('numbers inside html tag', () => {
        createRenderer(`<div>
        1234
     </div>`);
    })

    it('@{} inside html tag', () => {
        createRenderer(`<div>
        @{}
     </div>`);
    })

    it('h1tag', () => {
        createRenderer(`<div>
        <h1>Title</h1>
     </div>`);
    })

    it('a with href as #', () => {
        createRenderer(`<div>
        <a href="#">Title</a>
     </div>`);
    })

    it('| in html', () => {
        createRenderer(`<div>
        <h1>Title | Ujjwal</h1>
     </div>`);
    })

    it('tag with "_"', () => {
        createRenderer(`<div>
        <in_place of="name" />
     </div>`);
    })

    it('html with different closing tag', () => {
        try {
            createRenderer(`<div>dd</divv>`);
            throw new Error('there should be an error')
        } catch (error) {
            console.error("error", error);
            expect(error.message).to.be.equal(`Expected </div> but </divv> found.`)
        }
        // new Promise(() => {
        //     createRenderer(`<div>`)
        // }).then(done).catch(() => {
        //     done();
        // });
    })

    it(`text with ' character `, async () => {
        const compClass = createComponent(`
	<h1>
		Lorem Ipsum has been the industry's
	</h1>
        `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.textContent.trim()).equal("Lorem Ipsum has been the industry's");
    })

    it(`text with " character `, async () => {
        const compClass = createComponent(`
	<h1>
		Lorem Ipsum has been the industry"s
	</h1>
        `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.textContent.trim()).equal('Lorem Ipsum has been the industry"s');
    })

    it('lorem epsum long', async () => {
        const text = `<div>Lorem ipsum dolor sit amet. Sed earum numquam sit blanditiis vero sit ullam labore cum incidunt odit quo illo illo. In galisum laborum qui recusandae tempore sit voluptatem ratione non ipsum voluptatem. Vel omnis doloribus et atque alias 33 aliquid omnis rem ratione odit qui adipisci amet qui culpa omnis. Et consequatur quisquam At voluptatem omnis ea laboriosam dolorem ab eveniet quae et temporibus repellendus ad officia facere quo optio molestias. Et quia dolorem aut odio soluta aut commodi dolore est facilis atque vel cumque voluptas eum sunt maiores! Et  velit id labore amet qui ipsum temporibus et dolor consequatur. Et dolorum blanditiis est nulla sint non voluptatem debitis qui libero tempora. Eos ratione necessitatibus sed cumque expedita est commodi fugit qui repellat error rem inventore doloremque. Est doloribus porro 33 quasi voluptas qui temporibus quaerat a alias distinctio ad fuga repellendus aut necessitatibus magnam hic cumque magnam. Ut magni vitae aut minima minus quo sunt velit sed rerum necessitatibus ex saepe maxime eum laboriosam laborum est unde accusantium. Eos unde galisum aut voluptatem asperiores quo nulla dolorum est suscipit voluptas. Aut consequatur laboriosam eum delectus modi non quaerat voluptates et soluta minima. Ex minima iusto qui quas porro aut molestiae quis ad exercitationem sunt vel odio laudantium. Aut voluptas alias ex beatae nulla in quis nobis. Qui eligendi quaerat et ipsum repudiandae aut pariatur saepe aut debitis dolores sed magni distinctio est possimus omnis. Hic quia repudiandae est enim obcaecati cum voluptatem reiciendis qui alias culpa id mollitia voluptas hic facilis voluptatem. Et mollitia molestiae ut itaque aspernatur sit assumenda illo. Aut eligendi quasi et debitis natus sed odit galisum et velit voluptate hic perspiciatis eligendi. Et inventore veniam aut nisi molestiae ea delectus rerum id voluptatem totam sed ipsam quia! Nam eligendi delectus ut provident illo sed laboriosam internos in eveniet minima. Aut aspernatur omnis et deserunt dolor hic porro atque eum dolores accusamus et necessitatibus rerum? Ut dolore asperiores qui facere animi non impedit exercitationem aut veritatis praesentium et eaque perferendis ut reprehenderit ipsa qui deleniti architecto. Rem facilis enim aut nisi doloremque in laboriosam iure At unde deleniti eum quod enim eum dolorem blanditiis et quia sint! Qui recusandae adipisci qui voluptatibus molestias eum maiores odio est exercitationem fugiat et dignissimos corrupti ut perspiciatis laborum. Ut corrupti reiciendis qui excepturi nulla ad distinctio consequatur ad numquam sunt. Sint laboriosam aut ipsam inventore vel laborum cumque eum quod fuga ut voluptas saepe et consectetur autem. Vel magnam quia id tempore eligendi sit minima veritatis sit consequuntur doloribus. Eos dolores voluptatem et officia beatae vel assumenda autem eum unde omnis sit numquam consequatur ut culpa repudiandae qui voluptates pariatur. Et debitis galisum sit nemo temporibus ut dolor ullam hic dolorem sunt ex quibusdam iure. Aut quibusdam repellat nam cupiditate doloribus id eaque similique non rerum consequatur sit quia tempore in odio quos ex ipsa esse.</div>
`
        const compClass = createComponent(`
       ${text}
            `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.outerHTML.trim().length + 1).equal(text.trim().length)
    })

    it('Img tag', async () => {
        const text = `
			<img class="img-fluid img-profile rounded-circle mx-auto mb-2" src="img/profile.png" alt="profile" />

`
        const compClass = createComponent(`
       ${text}
            `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('IMG')
    })

    it('element with empty inner text', async () => {
        const html = `<span class="navbar-toggler-icon"></span>`;

        const compClass = createComponent(`
        ${html}
             `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('SPAN')
    })


    it('element with new line in opening tag', async () => {
        const html = `<button
>
    </button>`

        const compClass = createComponent(`
    ${html}
         `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('BUTTON')
    })

    it('element with new line in opening tag and space', async () => {
        const html = `<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
    	aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    	<span class="navbar-toggler-icon"></span>
    </button>`

        const compClass = createComponent(`
    ${html}
         `)

        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('BUTTON')
    })

    it('comment', async () => {
        const compClass = createComponent(`<div><!-- Author of JsStore --></div>`);
        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('DIV')
    })

    it('pre tag', async () => {
        const text = `<pre>
        dddd {{name}}
        </pre>`;
        const compClass = createComponent(text);
        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('PRE');
        expect(btn.textContent).equal(text.replace('<pre>', '').replace('</pre>', ''));
    })

    it('pre tag under div', async () => {
        const text = `<div>
        <pre>fff</pre>
        </div>`;
        const compClass = createComponent(text);
        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('DIV');
    })

    it('pre tag opposite', async () => {
        const text = `<div>
        dddd {{name}}
        </div>`;
        const compClass = createComponent(text);
        const component = await mount(compClass);
        const btn = component.element;
        expect(btn.tagName).equal('DIV');
        const removingSpaceAndNewLine = text.replace('<div>', '').replace('</div>', '')
            .replace(/[\n\r]/gm, "").replace(/\s\s+/g, ' ')
            .replace('{{name}}', 'ujjwal gupta').trimEnd();
        expect(btn.textContent).equal(removingSpaceAndNewLine);
    })

    it('fragment test', async () => {
        const html = `<div class="column center container">
       <>fff</>
    </div>`

        const compClass = createComponent(`
    ${html}
         `)

        const component = await mount(compClass);
        const el = component.element;
        expect(el.innerHTML).equal('fff')
    })

})