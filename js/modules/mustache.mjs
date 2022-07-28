var objectToString=Object.prototype.toString,isArray=Array.isArray||function(a){return"[object Array]"===objectToString.call(a)};function isFunction(a){return"function"==typeof a}function typeStr(a){return isArray(a)?"array":typeof a}function escapeRegExp(a){return a.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(a,b){return null!=a&&"object"==typeof a&&b in a}function primitiveHasOwnProperty(a,b){return null!=a&&"object"!=typeof a&&a.hasOwnProperty&&a.hasOwnProperty(b)}var regExpTest=RegExp.prototype.test;function testRegExp(a,b){return regExpTest.call(a,b)}var nonSpaceRe=/\S/;function isWhitespace(a){return!testRegExp(nonSpaceRe,a)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function escapeHtml(a){return(a+"").replace(/[&<>"'`=\/]/g,function(a){return entityMap[a]})}var whiteRe=/\s*/,spaceRe=/\s+/,equalsRe=/\s*=/,curlyRe=/\s*\}/,tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(a,b){function c(){if(m&&!n)for(;l.length;)delete k[l.pop()];else l=[];m=!1,n=!1}function d(a){if("string"==typeof a&&(a=a.split(spaceRe,2)),!isArray(a)||2!==a.length)throw new Error("Invalid tags: "+a);e=new RegExp(escapeRegExp(a[0])+"\\s*"),f=new RegExp("\\s*"+escapeRegExp(a[1])),g=new RegExp("\\s*"+escapeRegExp("}"+a[1]))}if(!a)return[];var e,f,g,h=!1,j=[],k=[],l=[],m=!1,n=!1,o="",p=0;d(b||mustache.tags);for(var q,r,s,t,u,v,w=new Scanner(a);!w.eos();){if(q=w.pos,s=w.scanUntil(e),s)for(var x=0,y=s.length;x<y;++x)t=s.charAt(x),isWhitespace(t)?(l.push(k.length),o+=t):(n=!0,h=!0,o+=" "),k.push(["text",t,q,q+1]),q+=1,"\n"===t&&(c(),o="",p=0,h=!1);if(!w.scan(e))break;if(m=!0,r=w.scan(tagRe)||"name",w.scan(whiteRe),"="===r?(s=w.scanUntil(equalsRe),w.scan(equalsRe),w.scanUntil(f)):"{"===r?(s=w.scanUntil(g),w.scan(curlyRe),w.scanUntil(f),r="&"):s=w.scanUntil(f),!w.scan(f))throw new Error("Unclosed tag at "+w.pos);if(u=">"==r?[r,s,q,w.pos,o,p,h]:[r,s,q,w.pos],p++,k.push(u),"#"===r||"^"===r)j.push(u);else if("/"===r){if(v=j.pop(),!v)throw new Error("Unopened section \""+s+"\" at "+q);if(v[1]!==s)throw new Error("Unclosed section \""+v[1]+"\" at "+q)}else"name"===r||"{"===r||"&"===r?n=!0:"="===r&&d(s)}if(c(),v=j.pop(),v)throw new Error("Unclosed section \""+v[1]+"\" at "+w.pos);return nestTokens(squashTokens(k))}function squashTokens(a){for(var b,c,d=[],e=0,f=a.length;e<f;++e)b=a[e],b&&("text"===b[0]&&c&&"text"===c[0]?(c[1]+=b[1],c[3]=b[3]):(d.push(b),c=b));return d}function nestTokens(a){for(var b,c,d=[],e=d,f=[],g=0,h=a.length;g<h;++g)switch(b=a[g],b[0]){case"#":case"^":e.push(b),f.push(b),e=b[4]=[];break;case"/":c=f.pop(),c[5]=b[2],e=0<f.length?f[f.length-1][4]:d;break;default:e.push(b);}return d}function Scanner(a){this.string=a,this.tail=a,this.pos=0}Scanner.prototype.eos=function(){return""===this.tail},Scanner.prototype.scan=function(a){var b=this.tail.match(a);if(!b||0!==b.index)return"";var c=b[0];return this.tail=this.tail.substring(c.length),this.pos+=c.length,c},Scanner.prototype.scanUntil=function(a){var b,c=this.tail.search(a);return-1===c?(b=this.tail,this.tail=""):0===c?b="":(b=this.tail.substring(0,c),this.tail=this.tail.substring(c)),this.pos+=b.length,b};function Context(a,b){this.view=a,this.cache={".":this.view},this.parent=b}Context.prototype.push=function(a){return new Context(a,this)},Context.prototype.lookup=function(a){var b,c=this.cache;if(c.hasOwnProperty(a))b=c[a];else{for(var d,e,f,g=this,h=!1;g;){if(0<a.indexOf("."))for(d=g.view,e=a.split("."),f=0;null!=d&&f<e.length;)f===e.length-1&&(h=hasProperty(d,e[f])||primitiveHasOwnProperty(d,e[f])),d=d[e[f++]];else d=g.view[a],h=hasProperty(g.view,a);if(h){b=d;break}g=g.parent}c[a]=b}return isFunction(b)&&(b=b.call(this.view)),b};function Writer(){this.templateCache={_cache:{},set:function(a,b){this._cache[a]=b},get:function(a){return this._cache[a]},clear:function(){this._cache={}}}}Writer.prototype.clearCache=function(){"undefined"!=typeof this.templateCache&&this.templateCache.clear()},Writer.prototype.parse=function(a,b){var c=this.templateCache,d=a+":"+(b||mustache.tags).join(":"),e="undefined"!=typeof c,f=e?c.get(d):void 0;return null==f&&(f=parseTemplate(a,b),e&&c.set(d,f)),f},Writer.prototype.render=function(a,b,c,d){var e=this.getConfigTags(d),f=this.parse(a,e),g=b instanceof Context?b:new Context(b,void 0);return this.renderTokens(f,g,c,a,d)},Writer.prototype.renderTokens=function(a,b,c,d,e){for(var f,g,h,j="",k=0,l=a.length;k<l;++k)h=void 0,f=a[k],g=f[0],"#"===g?h=this.renderSection(f,b,c,d,e):"^"===g?h=this.renderInverted(f,b,c,d,e):">"===g?h=this.renderPartial(f,b,c,e):"&"===g?h=this.unescapedValue(f,b):"name"===g?h=this.escapedValue(f,b,e):"text"===g&&(h=this.rawValue(f)),void 0!==h&&(j+=h);return j},Writer.prototype.renderSection=function(a,b,c,d,e){function f(a){return g.render(a,b,c,e)}var g=this,h="",i=b.lookup(a[1]);if(i){if(isArray(i))for(var k=0,l=i.length;k<l;++k)h+=this.renderTokens(a[4],b.push(i[k]),c,d,e);else if("object"==typeof i||"string"==typeof i||"number"==typeof i)h+=this.renderTokens(a[4],b.push(i),c,d,e);else if(isFunction(i)){if("string"!=typeof d)throw new Error("Cannot use higher-order sections without the original template");i=i.call(b.view,d.slice(a[3],a[5]),f),null!=i&&(h+=i)}else h+=this.renderTokens(a[4],b,c,d,e);return h}},Writer.prototype.renderInverted=function(a,b,c,d,e){var f=b.lookup(a[1]);if(!f||isArray(f)&&0===f.length)return this.renderTokens(a[4],b,c,d,e)},Writer.prototype.indentPartial=function(a,b,c){for(var d=b.replace(/[^ \t]/g,""),e=a.split("\n"),f=0;f<e.length;f++)e[f].length&&(0<f||!c)&&(e[f]=d+e[f]);return e.join("\n")},Writer.prototype.renderPartial=function(a,b,c,d){if(c){var e=this.getConfigTags(d),f=isFunction(c)?c(a[1]):c[a[1]];if(null!=f){var g=a[6],h=a[5],i=a[4],j=f;0==h&&i&&(j=this.indentPartial(f,i,g));var k=this.parse(j,e);return this.renderTokens(k,b,c,j,d)}}},Writer.prototype.unescapedValue=function(a,b){var c=b.lookup(a[1]);if(null!=c)return c},Writer.prototype.escapedValue=function(a,b,c){var d=this.getConfigEscape(c)||mustache.escape,e=b.lookup(a[1]);if(null!=e)return"number"==typeof e&&d===mustache.escape?e+"":d(e)},Writer.prototype.rawValue=function(a){return a[1]},Writer.prototype.getConfigTags=function(a){return isArray(a)?a:a&&"object"==typeof a?a.tags:void 0},Writer.prototype.getConfigEscape=function(a){return a&&"object"==typeof a&&!isArray(a)?a.escape:void 0};var mustache={name:"mustache.js",version:"4.2.0",tags:["{{","}}"],clearCache:void 0,escape:void 0,parse:void 0,render:void 0,Scanner:void 0,Context:void 0,Writer:void 0,set templateCache(a){defaultWriter.templateCache=a},get templateCache(){return defaultWriter.templateCache}},defaultWriter=new Writer;mustache.clearCache=function(){return defaultWriter.clearCache()},mustache.parse=function(a,b){return defaultWriter.parse(a,b)},mustache.render=function(a,b,c,d){if("string"!=typeof a)throw new TypeError("Invalid template! Template should be a \"string\" but \""+typeStr(a)+"\" was given as the first argument for mustache#render(template, view, partials)");return defaultWriter.render(a,b,c,d)},mustache.escape=escapeHtml,mustache.Scanner=Scanner,mustache.Context=Context,mustache.Writer=Writer;export default mustache;