"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[510],{63811:function(t,e,n){var r=n(78466);t.exports=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.mustBeMetaMask,n=void 0!==e&&e,i=t.silent,a=void 0!==i&&i,o=t.timeout,s=void 0===o?3e3:o;u();var c=!1;return new Promise((function(t){function e(){if(!c){c=!0,window.removeEventListener("ethereum#initialized",e);var i=window.ethereum;if(!i||n&&!i.isMetaMask){var o=n&&i?"Non-MetaMask window.ethereum detected.":"Unable to detect window.ethereum.";!a&&r.error("@metamask/detect-provider:",o),t(null)}else t(i)}}window.ethereum?e():(window.addEventListener("ethereum#initialized",e,{once:!0}),setTimeout((function(){e()}),s))}));function u(){if("boolean"!==typeof n)throw new Error("@metamask/detect-provider: Expected option 'mustBeMetaMask' to be a boolean.");if("boolean"!==typeof a)throw new Error("@metamask/detect-provider: Expected option 'silent' to be a boolean.");if("number"!==typeof s)throw new Error("@metamask/detect-provider: Expected option 'timeout' to be a number.")}}},10533:function(t,e,n){n.d(e,{d:function(){return m}});var r=n(15861),i=n(15671),a=n(43144),o=n(97326),s=n(60136),c=n(82963),u=n(61120),h=n(4942),d=n(64687),l=n.n(d),f=n(45781);function p(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=(0,u.Z)(t);if(e){var i=(0,u.Z)(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return(0,c.Z)(this,n)}}var m=function(t){(0,s.Z)(n,t);var e=p(n);function n(){var t,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return(0,i.Z)(this,n),t=e.call(this),(0,h.Z)((0,o.Z)(t),"clientId",void 0),t.clientId=r.clientId,t}return(0,a.Z)(n,[{key:"authenticateUser",value:function(){var t=(0,r.Z)(l().mark((function t(){var e,n,r,i,a,o,s,c,u,h;return l().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(this.provider&&null!==(e=this.chainConfig)&&void 0!==e&&e.chainId){t.next=2;break}throw f.RM.notConnectedError();case 2:if(n=this.chainConfig,r=n.chainNamespace,i=n.chainId,this.status===f.MP.CONNECTED){t.next=5;break}throw f.RM.notConnectedError("Not connected with wallet, Please login/connect first");case 5:return t.next=7,this.provider.request({method:"eth_accounts"});case 7:if(!((a=t.sent)&&a.length>0)){t.next=26;break}if(!(o=(0,f.Cb)(a[0],this.name))){t.next=14;break}if((0,f.$E)(o)){t.next=14;break}return t.abrupt("return",{idToken:o});case 14:return s={domain:window.location.origin,uri:window.location.href,address:a[0],chainId:parseInt(i,16),version:"1",nonce:Math.random().toString(36).slice(2),issuedAt:(new Date).toISOString()},t.next=17,(0,f.tV)(s,r);case 17:return c=t.sent,t.next=20,this.provider.request({method:"personal_sign",params:[c,a[0]]});case 20:return u=t.sent,t.next=23,(0,f.rn)(r,u,c,this.name,this.sessionTime,this.clientId);case 23:return h=t.sent,(0,f.Fr)(a[0],this.name,h),t.abrupt("return",{idToken:h});case 26:throw f.RM.notConnectedError("Not connected with wallet, Please login/connect first");case 27:case"end":return t.stop()}}),t,this)})));return function(){return t.apply(this,arguments)}}()},{key:"disconnect",value:function(){var t=(0,r.Z)(l().mark((function t(){var e;return l().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(this.status===f.MP.CONNECTED){t.next=2;break}throw f.RM.disconnectionError("Not connected with wallet");case 2:return t.next=4,this.provider.request({method:"eth_accounts"});case 4:(e=t.sent)&&e.length>0&&(0,f.qz)(e[0],this.name);case 6:case"end":return t.stop()}}),t,this)})));return function(){return t.apply(this,arguments)}}()}]),n}(f.J5)},41510:function(t,e,n){n.r(e),n.d(e,{MetamaskAdapter:function(){return k}});var r=n(15861),i=n(15671),a=n(43144),o=n(97326),s=n(11752),c=n(60136),u=n(82963),h=n(61120),d=n(4942),l=n(64687),f=n.n(l),p=n(63811),m=n.n(p),v=n(45781);function w(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=(0,h.Z)(t);if(e){var i=(0,h.Z)(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return(0,u.Z)(this,n)}}var k=function(t){(0,c.Z)(n,t);var e=w(n);function n(t){var r;return(0,i.Z)(this,n),r=e.call(this,t),(0,d.Z)((0,o.Z)(r),"adapterNamespace",v.yk.EIP155),(0,d.Z)((0,o.Z)(r),"currentChainNamespace",v.EN.EIP155),(0,d.Z)((0,o.Z)(r),"type",v.hN.EXTERNAL),(0,d.Z)((0,o.Z)(r),"name",v.rW.METAMASK),(0,d.Z)((0,o.Z)(r),"status",v.MP.NOT_READY),(0,d.Z)((0,o.Z)(r),"rehydrated",!1),(0,d.Z)((0,o.Z)(r),"metamaskProvider",null),r.chainConfig=(null===t||void 0===t?void 0:t.chainConfig)||null,r.sessionTime=(null===t||void 0===t?void 0:t.sessionTime)||86400,r}return(0,a.Z)(n,[{key:"provider",get:function(){return this.status===v.MP.CONNECTED&&this.metamaskProvider?this.metamaskProvider:null},set:function(t){throw new Error("Not implemented")}},{key:"init",value:function(){var t=(0,r.Z)(f().mark((function t(e){return f().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return(0,s.Z)((0,h.Z)(n.prototype),"checkInitializationRequirements",this).call(this),t.next=3,m()({mustBeMetaMask:!0});case 3:if(this.metamaskProvider=t.sent,this.metamaskProvider){t.next=6;break}throw v.Ty.notInstalled("Metamask extension is not installed");case 6:if(this.status=v.MP.READY,this.emit(v.n2.READY,v.rW.METAMASK),t.prev=8,v.cM.debug("initializing metamask adapter"),!e.autoConnect){t.next=14;break}return this.rehydrated=!0,t.next=14,this.connect();case 14:t.next=19;break;case 16:t.prev=16,t.t0=t.catch(8),this.emit(v.n2.ERRORED,t.t0);case 19:case"end":return t.stop()}}),t,this,[[8,16]])})));return function(e){return t.apply(this,arguments)}}()},{key:"setAdapterSettings",value:function(t){this.status!==v.MP.READY&&(null!==t&&void 0!==t&&t.sessionTime&&(this.sessionTime=t.sessionTime),null!==t&&void 0!==t&&t.clientId&&(this.clientId=t.clientId))}},{key:"connect",value:function(){var t=(0,r.Z)(f().mark((function t(){var e=this;return f().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if((0,s.Z)((0,h.Z)(n.prototype),"checkConnectionRequirements",this).call(this),this.chainConfig||(this.chainConfig=(0,v.h2)(v.EN.EIP155,1)),this.status=v.MP.CONNECTING,this.emit(v.n2.CONNECTING,{adapter:v.rW.METAMASK}),this.metamaskProvider){t.next=6;break}throw v.RM.notConnectedError("Not able to connect with metamask");case 6:return t.prev=6,t.next=9,this.metamaskProvider.request({method:"eth_requestAccounts"});case 9:if(this.metamaskProvider.chainId===this.chainConfig.chainId){t.next=13;break}return t.next=13,this.switchChain(this.chainConfig);case 13:if(this.status=v.MP.CONNECTED,this.provider){t.next=16;break}throw v.RM.notConnectedError("Failed to connect with provider");case 16:return this.provider.once("disconnect",(function(){e.disconnect()})),this.emit(v.n2.CONNECTED,{adapter:v.rW.METAMASK,reconnected:this.rehydrated}),t.abrupt("return",this.provider);case 21:throw t.prev=21,t.t0=t.catch(6),this.status=v.MP.READY,this.rehydrated=!1,this.emit(v.n2.ERRORED,t.t0),v.RM.connectionError("Failed to login with metamask wallet");case 27:case"end":return t.stop()}}),t,this,[[6,21]])})));return function(){return t.apply(this,arguments)}}()},{key:"disconnect",value:function(){var t=(0,r.Z)(f().mark((function t(){var e,r,i=arguments;return f().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return r=i.length>0&&void 0!==i[0]?i[0]:{cleanup:!1},t.next=3,(0,s.Z)((0,h.Z)(n.prototype),"disconnect",this).call(this);case 3:null===(e=this.provider)||void 0===e||e.removeAllListeners(),r.cleanup?(this.status=v.MP.NOT_READY,this.metamaskProvider=null):this.status=v.MP.READY,this.rehydrated=!1,this.emit(v.n2.DISCONNECTED);case 7:case"end":return t.stop()}}),t,this)})));return function(){return t.apply(this,arguments)}}()},{key:"getUserInfo",value:function(){var t=(0,r.Z)(f().mark((function t(){return f().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(this.status===v.MP.CONNECTED){t.next=2;break}throw v.RM.notConnectedError("Not connected with wallet, Please login/connect first");case 2:return t.abrupt("return",{});case 3:case"end":return t.stop()}}),t,this)})));return function(){return t.apply(this,arguments)}}()},{key:"switchChain",value:function(){var t=(0,r.Z)(f().mark((function t(e){return f().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(this.metamaskProvider){t.next=2;break}throw v.RM.notConnectedError("Not connected with wallet");case 2:return t.prev=2,t.next=5,this.metamaskProvider.request({method:"wallet_switchEthereumChain",params:[{chainId:e.chainId}]});case 5:case 12:t.next=15;break;case 7:if(t.prev=7,t.t0=t.catch(2),4902!==t.t0.code){t.next=14;break}return t.next=12,this.metamaskProvider.request({method:"wallet_addEthereumChain",params:[{chainId:e.chainId,chainName:e.displayName,rpcUrls:[e.rpcTarget]}]});case 14:throw t.t0;case 15:case"end":return t.stop()}}),t,this,[[2,7]])})));return function(e){return t.apply(this,arguments)}}()}]),n}(n(10533).d)}}]);