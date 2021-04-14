/*!
 * @license
 * Copyright 2019-2021 The Go Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */const Key={UP:"ArrowUp",DOWN:"ArrowDown",LEFT:"ArrowLeft",RIGHT:"ArrowRight",ENTER:"Enter",ASTERISK:"*",SPACE:" ",END:"End",HOME:"Home",Y:"y",FORWARD_SLASH:"/",QUESTION_MARK:"?"};class DocNavTreeController{constructor(e){this.el=e;this.focusedIndex=0;this.visibleItems=[];this.searchString="";this.lastKeyDownTimeStamp=-Infinity;this.el=e,this.selectedEl=null,this.focusedIndex=0,this.visibleItems=[],this.searchString="",this.lastKeyDownTimeStamp=-Infinity,this.addEventListeners(),this.updateVisibleItems(),this.initialize()}initialize(){this.el.querySelectorAll("[role='treeitem']").forEach(e=>{e.addEventListener("click",t=>this.handleItemClick(t))}),this.el.querySelectorAll("[data-aria-owns]").forEach(e=>{e.setAttribute("aria-owns",e.getAttribute("data-aria-owns")??"")})}addEventListeners(){this.el.addEventListener("keydown",e=>this.handleKeyDown(e))}setFocusedIndex(e){if(e===this.focusedIndex||e===-1)return;let t=this.visibleItems[this.focusedIndex];t.setAttribute("tabindex","-1"),t=this.visibleItems[e],t.setAttribute("tabindex","0"),t.focus(),this.focusedIndex=e}setSelectedId(e){if(this.selectedEl&&(this.selectedEl.removeAttribute("aria-selected"),this.selectedEl=null),e?this.selectedEl=this.el.querySelector(`[role='treeitem'][href='#${e}']`):this.visibleItems.length>0&&(this.selectedEl=this.visibleItems[0]),!this.selectedEl)return;const t=this.el.querySelector('[aria-level="1"][aria-expanded="true"]');t&&!t.parentElement?.contains(this.selectedEl)&&this.collapseItem(t),this.selectedEl.getAttribute("aria-level")==="1"&&this.selectedEl.setAttribute("aria-expanded","true"),this.selectedEl.setAttribute("aria-selected","true"),this.expandAllParents(this.selectedEl),this.scrollElementIntoView(this.selectedEl)}expandAllSiblingItems(e){const t=e.getAttribute("aria-level");this.el.querySelectorAll(`[aria-level='${t}'][aria-expanded='false']`).forEach(i=>{i.setAttribute("aria-expanded","true")}),this.updateVisibleItems(),this.focusedIndex=this.visibleItems.indexOf(e)}expandAllParents(e){if(!this.visibleItems.includes(e)){let t=this.owningItem(e);for(;t;)this.expandItem(t),t=this.owningItem(t)}}scrollElementIntoView(e){const t=55,i=document.documentElement.clientHeight,s=e.getBoundingClientRect(),r=(i-t)/2;if(s.top<t)this.el.scrollTop-=t-s.top-s.height+r;else if(s.bottom>i)this.el.scrollTop=s.bottom-i+r;else return}handleItemClick(e){const t=e.target;this.setFocusedIndex(this.visibleItems.indexOf(t)),t.hasAttribute("aria-expanded")&&this.toggleItemExpandedState(t),this.closeInactiveDocNavGroups(t)}closeInactiveDocNavGroups(e){if(e.hasAttribute("aria-expanded")){const t=e.getAttribute("aria-level");document.querySelectorAll(`[aria-level="${t}"]`).forEach(i=>{i.getAttribute("aria-expanded")==="true"&&i!==e&&i.setAttribute("aria-expanded","false")}),this.updateVisibleItems(),this.focusedIndex=this.visibleItems.indexOf(e)}}handleKeyDown(e){const t=e.target;switch(e.key){case Key.ASTERISK:t&&this.expandAllSiblingItems(t),e.stopPropagation(),e.preventDefault();return;case Key.FORWARD_SLASH:case Key.QUESTION_MARK:return;case Key.DOWN:this.focusNextItem();break;case Key.UP:this.focusPreviousItem();break;case Key.LEFT:t?.getAttribute("aria-expanded")==="true"?this.collapseItem(t):this.focusParentItem(t);break;case Key.RIGHT:{switch(t?.getAttribute("aria-expanded")){case"false":this.expandItem(t);break;case"true":this.focusNextItem();break}break}case Key.HOME:this.setFocusedIndex(0);break;case Key.END:this.setFocusedIndex(this.visibleItems.length-1);break;case Key.ENTER:if(t?.tagName==="A")return;case Key.SPACE:t?.click();break;default:this.handleSearch(e);return}e.preventDefault(),e.stopPropagation()}handleSearch(e){if(e.metaKey||e.altKey||e.ctrlKey||e.isComposing||e.key.length>1||!e.key.match(/\S/))return;const t=1e3;e.timeStamp-this.lastKeyDownTimeStamp>t&&(this.searchString=""),this.lastKeyDownTimeStamp=e.timeStamp,this.searchString+=e.key.toLocaleLowerCase();const i=this.visibleItems[this.focusedIndex].textContent?.toLocaleLowerCase();(this.searchString.length===1||!i?.startsWith(this.searchString))&&this.focusNextItemWithPrefix(this.searchString),e.stopPropagation(),e.preventDefault()}focusNextItemWithPrefix(e){let t=this.focusedIndex+1;for(t>this.visibleItems.length-1&&(t=0);t!==this.focusedIndex;){if(this.visibleItems[t].textContent?.toLocaleLowerCase().startsWith(e)){this.setFocusedIndex(t);return}t>=this.visibleItems.length-1?t=0:t++}}toggleItemExpandedState(e){e.getAttribute("aria-expanded")==="true"?this.collapseItem(e):this.expandItem(e)}focusPreviousItem(){this.setFocusedIndex(Math.max(0,this.focusedIndex-1))}focusNextItem(){this.setFocusedIndex(Math.min(this.visibleItems.length-1,this.focusedIndex+1))}collapseItem(e){e.setAttribute("aria-expanded","false"),this.updateVisibleItems()}expandItem(e){e.setAttribute("aria-expanded","true"),this.updateVisibleItems()}focusParentItem(e){const t=this.owningItem(e);t&&this.setFocusedIndex(this.visibleItems.indexOf(t))}owningItem(e){const t=e?.closest("[role='group']");return t?t.parentElement?.querySelector(`[aria-owns='${t.id}']`):null}updateVisibleItems(){const e=Array.from(this.el.querySelectorAll("[role='treeitem']")),t=Array.from(this.el.querySelectorAll("[aria-expanded='false'] + [role='group'] [role='treeitem']"));this.visibleItems=e.filter(i=>!t.includes(i))}}class DocPageController{constructor(e,t,i){this.contentEl=i;if(!e||!i){console.warn("Unable to find all elements needed for navigation");return}this.navController=new DocNavTreeController(e),t&&(this.mobileNavController=new MobileNavController(t)),window.addEventListener("hashchange",()=>this.handleHashChange()),this.updateSelectedIdFromWindowHash()}handleHashChange(){this.updateSelectedIdFromWindowHash()}updateSelectedIdFromWindowHash(){const e=this.targetIdFromLocationHash();if(this.navController?.setSelectedId(e),this.mobileNavController&&this.mobileNavController.setSelectedId(e),e!==""){const t=this.contentEl?.querySelector(`[id='${e}']`);t&&t.focus()}}targetIdFromLocationHash(){return window.location.hash&&window.location.hash.substr(1)}}class MobileNavController{constructor(e){this.el=e;this.selectEl=e.querySelector("select"),this.labelTextEl=e.querySelector(".js-mobileNavSelectText"),this.selectEl?.addEventListener("change",i=>this.handleSelectChange(i));const t="-57px";this.intersectionObserver=new IntersectionObserver(i=>this.intersectionObserverCallback(i),{rootMargin:`${t} 0px 0px 0px`,threshold:1}),this.intersectionObserver.observe(this.el)}setSelectedId(e){!this.selectEl||(this.selectEl.value=e,this.updateLabelText())}updateLabelText(){if(!this.labelTextEl||!this.selectEl)return;const e=this.selectEl?.selectedIndex;if(e===-1){this.labelTextEl.textContent="";return}this.labelTextEl.textContent=this.selectEl.options[e].textContent}handleSelectChange(e){window.location.hash=`#${e.target.value}`,this.updateLabelText()}intersectionObserverCallback(e){const t="DocNavMobile--withShadow";e.forEach(i=>{const s=i.intersectionRatio===1;i.target.classList.toggle(t,!s)})}}new DocPageController(document.querySelector(".js-tree"),document.querySelector(".js-mobileNav"),document.querySelector(".js-unitDetailsContent"));
//# sourceMappingURL=sidenav.js.map
