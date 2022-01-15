import { createRenderer } from "../src/index";

describe('For loop', function () {
    it('simple', () => {
        createRenderer(`
        <div>
            <div :for(item in items)>
                {{item}}
            </div>
        </div>
        `)
    })

    it('with +index', () => {
        createRenderer(`
        <div>
            <div class="todo" :for(item,index in todos)>
            {{index+1}} {{item}}
        </div>
        </div>
        `)
    })

    it('for on root element', (done) => {
        new Promise(_ => {
            createRenderer(`
            <div :for(item in items)>
                {{item}}
            </div>
        `)
        }).catch(() => {
            done();
        })
    })

    it('looping on table', () => {
        createRenderer(`
        <table>
        <tr>
            <td><input id="name" :model(name) ></input></td>
            <td id="btnAdd" on:click="addStudent"><button>Add Student</button></td>
        </tr>
          <tr class="tr-list" :for(student,key in students)>
           <td>{{key}}</td>
           <td class="edit-student-input" :if(student.isEdit) >
                <input :model(editName) ></input>
           </td>
           <td :else >{{student.name}}</td>
           <td :if(student.isEdit) on:click="()=>{updateStudent(key)}"><button id="btnUpdateStudent">UpdateStudent</button></td>
           <td :else on:click="()=>{editStudent(key)}"><button id="btnEditStudent">EditStudent</button></td>
            <td><button class="btn-delete" on:click="()=>{deleteStudent(key)}">Delete</button></td>
          
           </tr>
        </table>
        `)
    })
})