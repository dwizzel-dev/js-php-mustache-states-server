
//only global mean window.xxx

window.onClickable = function(){
    console.log('ONCLICKABLE:', arguments)
}

const attr = (name, value) => {
    const attr = document.createAttribute(name)
    attr.value = value
    return attr
  }

const elmt = (name) => {
    return document.createElement(name)
}

const cnode = (type, attributes, data, content) => {
    const el = elmt(type)
    if (attributes ?? false) {
        Object.keys(attributes).forEach((row) => {
            el.setAttributeNode(attr(row, attributes[row]))
        })
    }
    if (data ?? false) {
        Object.keys(data).forEach((row) => {
            el.setAttributeNode(attr(`data-${row}`, data[row]))
        })
    }
    if (content ?? false) {
        el.textContent = content
    }
    return el
}

const Appz = () => {
    return new Promise(resolve => {
        if(window.appz === undefined){
            let t = setInterval(() => {
                if(window.appz !== undefined){
                    clearInterval(t)
                    resolve(window.appz)
                }    
            })        
        }else{
            resolve(window.appz)
        }
    })
}

const anode = async (id, type, attr, content) => {
    const el = document.getElementById(id).appendChild(cnode(type, attr))
        if(content !== undefined && content !== null){
            el.innerHTML = content
        }
    await Appz().then(async (appz) => {
        if(attr.hasOwnProperty('data-binded')){
            await appz.binded(el)
        }    
        if(attr.hasOwnProperty('data-binding')){
            await appz.binding(el)
        }
        if(attr.hasOwnProperty('data-binders')){
            await appz.binders(el)
        }
        if(attr.hasOwnProperty('data-action')){
            await appz.action(el)
        }
    })  
    
    return el
}

const sleep = m => new Promise((resolve) => setTimeout(() => {resolve()}, m))

const listAllEventListeners = () => {
    const allElements = Array.prototype.slice.call(document.querySelectorAll('*'));
    allElements.push(document); // we also want document events
    const types = [];
    for (let ev in window) {
      if (/^on/.test(ev)) types[types.length] = ev;
    }
    let elements = [];
    for (let i = 0; i < allElements.length; i++) {
      const currentElement = allElements[i];
      for (let j = 0; j < types.length; j++) {
        if (typeof currentElement[types[j]] === 'function') {
          elements.push({
            "node": currentElement,
            "type": types[j],
            "func": currentElement[types[j]].toString(),
          });
        }
      }
    }
    return elements.sort(function(a,b) {
      return a.type.localeCompare(b.type);
    });
}

const addMenus = async () => {
    
    const prop = `menus`
    const container = 'menus-' + Math.random().toString().replace('.', '')

    await anode('body', 'div', {id: container}, `
        <input type="hidden" value="${prop}" data-binders="@menus.json.php?lang=fr">
        <div class="container wrap">
            <div class="response">
                <span>Menus Data:</span>
                <div data-binded="${prop}"></div>        
                <button class="clear" data-action="delete" data-prop="${prop}">clear state</button>
            </div>    
            <div class="text infos" data-binded="${prop}" data-templated="#menus">loading ${prop} ...</div>
        </div>
    `)

    traverse(container)

    return container
}

const addNews = async (news) => {

    const prop = `news`
    const container = 'news-' + Math.random().toString().replace('.', '')
    
    await anode('body', 'div', {id: container}, `
        <input type="hidden" value="${prop}" data-binders="@news.json.php?cat=${news}&uid=${container}">
        <div class="container wrap">
            <div class="response">
                <span>News Data:</span>
                <div data-binded="${prop}"></div>        
                <button class="clear" data-action="delete" data-prop="${prop}">clear state</button>
            </div>    
            <div class="text infos" data-binded="${prop}" data-templated="#news">loading ${news} ...</div>
        </div>
    `)

    traverse(container)

    return container

}

const traverse = async (id) => {
    await Appz().then(async (appz) => {
        //element that can init a state from json base64 encoded or files, first thing to check
         for await (const item of document.querySelectorAll(`#${id} [data-binders]`)) {
             await appz.binders(item)
         }
         //element that receive the state, third thing to check!!!
         for await (const item of document.querySelectorAll(`#${id} [data-binded]`)) {
             await appz.binded(item)
         }
         //element that can delete or change object from json input, fourth thing
         for await (const item of document.querySelectorAll(`#${id} [data-action]`)) {
             await appz.action(item)
         }
         //element that can delete or change object from json input, fourth thing
         for await (const item of document.querySelectorAll(`#${id} [data-binding]`)) {
             await appz.binding(item)
         }
     })  
}


// pushing later ondemand test with timeout or event scroll

const test = async (delay) => {

    //a listener in javascript on a specific prop change
    Appz().then(async (appz) => {
        let loaded = false
        let id = null
        let s = await appz.gstates('interest.sport')
        if(['soccer', 'foot'].indexOf(s) !== -1){
            loaded = true
            addNews(s).then((container) => {
                id = container    
                console.log('NEWSCONTAINERS:', container)
            })
        }    
        appz.obsstates('interest.sport', (s) => {
            console.log('OBSSTATES[interest.sport]:', s)
            if(['soccer', 'foot'].indexOf(s) !== -1){
                //fetch the news
                if(!loaded){
                    loaded = true
                    //we will load some sports news
                    addNews(s).then((container) => {
                        id = container    
                        console.log('NEWSCONTAINERS:', container)
                    })
                }    
            }else{
                try{
                    if(id !== null && loaded){
                        //remove the news 
                        document.getElementById(id).remove();   
                        loaded = false 
                    }    
                }catch(e){
                    console.error(e)
                }    
            }
        })
        appz.obsstates('menus', (obj) => {
            console.log('OBSSTATES[menus]:', obj)
        })
    })

    //this will inject on scroll event to lazy load it
    const scrollListener = async (ev) => {
        //remove it since we only want it one time only
        document.removeEventListener('scroll', scrollListener)
        //we can lazy load our bottom Menus
        await addMenus()
    }
    //prevent default
    document.addEventListener('scroll', scrollListener, {passive: true});

    //those are lately injected with binded/binding to test listener 
    !((t) => {
        return new Promise(resolve => {
            setTimeout(async () => {
                anode('personal-row-text', 'input', {
                    type: 'text',
                    value: "Femme",
                    placeholder: "Gender :",
                    'data-binded': "personal.gender",
                    'data-binding': "personal.gender"
                })
                resolve(t)
            }, t);
        })
    })(delay).then((t) => {
        return new Promise(resolve => {
            setTimeout(async () => {
                anode('personal-row-text', 'input', {
                    type: 'text',
                    class: 'binding-binded',
                    placeholder: "Marital :",
                    'data-binded': "personal.marital",
                    'data-binding': "personal.marital"
                })
                resolve(t)
            }, t);
        })
    }).then((t) => {
        setInterval(() => {
            console.table(listAllEventListeners())
        }, 30000);
    })    
}


test(1000)

//EOF