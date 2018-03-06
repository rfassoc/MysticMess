(function() {

  const chat = document.getElementById('chat');
  class Background {
    constructor(cssClass, dark) {
      this.cssClass = cssClass;
      this.dark = dark;
    }

    activate() {
      chat.classList.add(this.cssClass);
      if (this.dark) chat.classList.add('dark');
    }
  }
  const bgs = {
    day: new Background('bg1', false),
    night: new Background('bg2', true),
    dawn: new Background('bg3', false),
    noon: new Background('bg4', false),
    dusk: new Background('bg5', true),
    code: new Background('bg6', true),
  };

  const msgList = document.getElementById('msg-list');
  let scrollTask;
  function sendMsgRaw(author, body) {
    const msg = document.createElement("div");
    msg.setAttribute('class', 'msg');
    if (author.right) msg.classList.add('right');
    msg.innerHTML = `<div class="msg-avatar">
  <img class="msg-avatar-img" src="${author.avatar}"/>
</div>
<div class="msg-content">
  <div class="msg-author">
    <span class="msg-author-text">${author.name}</span>
  </div>
  ${body}
</div>`;
    msgList.appendChild(msg);
    if (scrollTask) window.clearTimeout(scrollTask);
    scrollTask = window.setTimeout(function() {
      msg.scrollIntoView({behavior: 'smooth'});
    }, 1);
    return msg;
  }

  class Member {
    constructor(name, colour, avatar, right = false) {
      this.name = name;
      this.colour = colour;
      this.avatar = avatar;
      this.right = right;
    }
    
    send(content) {
      return sendMsgRaw(this, `<div class="msg-balloon" style="background-color: #${this.colour}; border-top-color: #${this.colour};">
    <span class="msg-balloon-text">${content}</span>
</div>`);
    }
  }
  const rfa = {
    seven: new Member('707', 'fff1f1', 'img/avatar/707.png'),
    jaehee: new Member('Jaehee Kang', 'fff5eb', 'img/avatar/jaehee.jpg'),
    yoosung: new Member('Yoosung★', 'eefff4', 'img/avatar/yoosung.jpg'),
    hyun: new Member('ZEN', 'e5e5e5', 'img/avatar/zen.jpg'),
    jumin: new Member('Jumin Han', 'f2fdfe', 'img/avatar/jumin.jpg'),
    jihyun: new Member('V', 'c9fbf8', 'img/avatar/v.jpg'),
    rika: new Member('Rika', 'fff6d7', 'img/avatar/question.jpg'),
    ray: new Member('Unknown', 'f3e6fa', 'img/avatar/question.jpg'),
  };

  const chatName = document.getElementById('chat-name');
  function updateName(members) {
    chatName.innerText = members.map(m => m.name).sort().join(', ');
  }

  const wrapper = document.getElementById('wrapper');
  const msgBtnIcon = document.getElementById('msg-button-icon');
  const msgBtnText = document.getElementById('msg-button-text');
  let chatState;
  class ChatroomState {
    constructor(btnText, icon, reply = false) {
      this.btnText = btnText;
      this.icon = icon;
      this.reply = reply;
    }

    activate() {
      chatState = this;
      msgBtnText.innerText = this.btnText;
      msgBtnIcon.setAttribute('src', this.icon);
      if (this.reply) {
        wrapper.classList.add('answer');
      } else {
        wrapper.classList.remove('answer');
      }
    }
  }
  const state = {
    playing: new ChatroomState('Pause', 'img/icon/pause.png'),
    paused: new ChatroomState('Play', 'img/icon/play.png'),
    waiting: new ChatroomState('Answer', 'img/icon/reply.png', true),
  };
  state.playing.activate();

  const members = [rfa.jaehee, rfa.jumin, rfa.yoosung];
  const mc = new Member('Eve', 'ffffed', 'img/avatar/question.jpg', true);
  members.push(mc);

  updateName(members);
  bgs.night.activate();

  (async function() {
    function sleep() {
      return new Promise((res, rej) => window.setTimeout(res, 800));
    }
    rfa.seven.send('cats are just very small very furry humans');
    await sleep();
    mc.send('wtf');
    await sleep();
    for (const p of Object.values(rfa)) {
      if (p !== rfa.seven) {
        p.send('wtf');
        await sleep();
      }
    }
    state.playing.activate();

    rfa.seven.send('why are you booing me? i\'m right');
  })();

})();