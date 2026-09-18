/* JR Store · sw.js · แจ้งเตือนนอกแอป + เลขบนไอคอน */
self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});

/* นับจำนวนเตือนที่ยังไม่ได้เปิดดู (เก็บใน cache เพราะ SW ไม่มี localStorage) */
async function badgeGet(){try{var c=await caches.open('jr-badge');var r=await c.match('/n');return r?(+(await r.text())||0):0;}catch(e){return 0;}}
async function badgeSet(n){try{var c=await caches.open('jr-badge');await c.put('/n',new Response(String(n)));if(self.navigator&&self.navigator.setAppBadge){if(n>0)await self.navigator.setAppBadge(n);else await self.navigator.clearAppBadge();}}catch(e){}}

self.addEventListener('push',function(e){
  var d={};try{d=e.data?e.data.json():{};}catch(x){d={title:'JR Store',body:e.data?e.data.text():''};}
  e.waitUntil((async function(){
    var n=(await badgeGet())+1;await badgeSet(n);
    await self.registration.showNotification(d.title||'JR Store',{
      body:d.body||'',tag:d.tag||undefined,renotify:!!d.tag,
      icon:'/icon-192.png',badge:'/icon-192.png',
      data:{url:d.url||'/'},vibrate:[120,60,120]
    });
  })());
});

self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var url=(e.notification.data&&e.notification.data.url)||'/';
  e.waitUntil((async function(){
    var all=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(var i=0;i<all.length;i++){var c=all[i];if('focus' in c){try{c.postMessage({type:'jr-open',url:url});}catch(x){}return c.focus();}}
    if(self.clients.openWindow)return self.clients.openWindow('/'+(url.indexOf('#')===0?url:''));
  })());
});

/* แอปเปิดอยู่ → บอกจำนวนค้างจริง หรือสั่งล้าง */
self.addEventListener('message',function(e){
  var d=e.data||{};
  if(d.type==='jr-badge')badgeSet(+d.n||0);
});
