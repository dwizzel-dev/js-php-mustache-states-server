
//only global mean window.xxx

window.onClickable = function(){
    console.log('CLICK:', arguments);
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
    await Appz().then(async (appz) => {
        const el = document.getElementById(id).appendChild(cnode(type, attr))
        if(content !== undefined && content !== null){
            el.innerHTML = content
        }
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
    
    //@NOTES 
    //if it doesnt have any dependecies on async data or get set thing
    //no neeed to await anything since it will listen on before or after dta arrives

    //create a container element

    //our data binders states first since it takes longer to load   
    anode('body', 'input', {
        type: 'hidden',
        value: 'menus',
        'data-binders': "@menus.json.php?lang=fr"
    })
    
    
    //container    
    anode('body', 'div', {class: 'container', id: 'menus-container'})
    //reponse box
    anode('menus-container', 'div', {class: 'response', id: 'menus-container-response'})
    //title
    anode('menus-container-response', 'span', {}, 'Menus Data: ')
    //the binded data 
    anode('menus-container-response', 'div', {'data-binded': 'menus'})
    //the delete button
    anode('menus-container-response', 'button', {
        class: 'clear',
        'data-action': 'delete',
        'data-prop': 'menus'
    }, 'clear state')
    
    //create a div using the template and states

    //container
    anode('body', 'div', {class: 'container', id: 'menus-template'})
    //the template div
    anode('menus-template', 'div', {
        class: 'text infos',
        'data-binded': 'menus',
        'data-templated': '@menus'
    }, 'loading menus ...')
   
    
}

const addNews = async (news) => {

    //@NOTES 
    //if it doesnt have any dependecies on async data or get set thing
    //no neeed to await anything since it will listen on before or after dta arrives

    //create a container element

    const prop = `news`

    //our data binders states first since it takes longer to load   
    await anode('body', 'input', {
        type: 'hidden',
        value: prop,
        'data-binders': `@news.json.php?cat=${news}`
    })
    
    const newsId = Math.random().toString().replace('.', '')
    const container = `news-${news}-container-${newsId}`
    const response = `${container}-response`
    const template = `${container}-template`

    //container    
    await anode('body', 'div', {class: 'container', id: container})
    //reponse box
    await anode(container, 'div', {class: 'response', id: response})
    //title
    await anode(response, 'span', {}, 'News Data: ')
    //the binded data 
    await anode(response, 'div', {'data-binded': prop})
    //the delete button
    await anode(response, 'button', {
        class: 'clear',
        'data-action': 'delete',
        'data-prop': prop
    }, 'clear state')
    
    //create a div using the template and states

    //container
    await anode('body', 'div', {class: 'container', id: template})
    //the template div
    await anode(template, 'div', {
        class: 'text infos',
        'data-binded': prop,
        'data-templated': `@news`
    }, `loading ${news} ...`)

    return {container, template}
}


// pushing later ondemand test with timeout or event scroll

const test = async (delay) => {

    //a listener in javascript on a specific prop change
    Appz().then(async(appz) => {
        let loaded = false
        let ids = null
        appz.obsstates('interest.sport', (s) => {
            console.log('OBSSTATES[interest.sport]:', s)
            if(s === 'soccer'){
                //fetch the news
                if(!loaded){
                    loaded = true
                    //we will load some sports news
                    addNews('soccer').then((containers) => {
                        ids = containers    
                        console.log('NEWSCONTAINERS:', containers)
                    })
                }    
            }else{
                try{
                    if(ids !== null && loaded){
                        //remove the news 
                        document.getElementById(ids.container).remove();   
                        document.getElementById(ids.template).remove();  
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
        setTimeout(() => {
            console.table(listAllEventListeners())
        }, t);
    })    
}


test(1000)

//EOF