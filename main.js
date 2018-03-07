(() => {

  // background stuff
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

  // message sending stuff
  const msgList = document.getElementById('msg-list');
  let scrollTask;
  function sendRaw(body) {
    const msg = document.createElement("div");
    msg.setAttribute('class', 'msg');
    msg.innerHTML = body;
    msgList.appendChild(msg);
    if (scrollTask) window.clearTimeout(scrollTask);
    scrollTask = window.setTimeout(() => msg.scrollIntoView({behavior: 'smooth'}), 1);
    return msg;
  }
  function sendMsg(author, body) {
    const msg = sendRaw(`<div class="msg-avatar">
  <img class="msg-avatar-img" src="${author.avatar}"/>
</div>
<div class="msg-content">
  <div class="msg-author">
    <span class="msg-author-text">${author.name}</span>
  </div>
  ${body}
</div>`);
    if (author.right) msg.classList.add('right');
    return msg;
  }
  function sendStatus(content) {
    const msg = sendRaw(`<span class="status-text">${content}</span>`);
    msg.classList.add('status');
    return msg;
  }

  // chatroom member stuff
  class Member {
    constructor(name, colour, avatar, right = false) {
      this.name = name;
      this.colour = colour;
      this.avatar = avatar;
      this.right = right;
    }
    
    send(content, options = {}) {
      const msg = sendMsg(this, `<div class="msg-balloon" style="background-color: #${this.colour}; border-top-color: #${this.colour};">
    <span class="msg-balloon-text">${content}</span>
</div>`);
      if (options.classes) {
        for (const cssClass of options.classes) msg.classList.add(cssClass);
      }
      if (options.shake) doShake();
      return msg;
    }

    sendJoin() {
      return sendStatus(`${this.name} has entered the chatroom.`);
    }

    sendLeave() {
      return sendStatus(`${this.name} has left the chatroom.`);
    }
  }
  const rfa = {
    seven: new Member('707', 'fff1f1', 'img/avatar/707.png'),
    jaehee: new Member('Jaehee Kang', 'fff5eb', 'img/avatar/jaehee.jpg'),
    yoosung: new Member('Yoosung★', 'eefff4', 'img/avatar/yoosung.jpg'),
    hyun: new Member('ZEN', 'e5e5e5', 'img/avatar/zen.jpg'),
    jumin: new Member('Jumin Han', 'f2fdfe', 'img/avatar/jumin.png'),
    jihyun: new Member('V', 'c9fbf8', 'img/avatar/v.jpg'),
    rika: new Member('Rika', 'fff6d7', 'img/avatar/question.jpg'),
    ray: new Member('Unknown', 'f3e6fa', 'img/avatar/question.jpg'),
  };

  // chat name stuff
  const chatName = document.getElementById('chat-name');
  function updateName(members) {
    const newName = [...members].map(m => m.name).sort().join(', ');
    chatName.innerText = newName;
    document.title = newName;
  }

  // chatroom state stuff
  const wrapper = document.getElementById('wrapper');
  const msgBtnIcon = document.getElementById('msg-button-icon');
  const msgBtnText = document.getElementById('msg-button-text');
  let chatState, stateCtx;
  const playableCallbacks = new Set();
  class ChatroomState {
    constructor(btnText, icon, playable = true, reply = false) {
      this.btnText = btnText;
      this.icon = icon;
      this.playable = playable;
      this.reply = reply;
    }

    activate(ctx = null) {
      chatState = this;
      stateCtx = ctx;
      msgBtnText.innerText = this.btnText;
      msgBtnIcon.setAttribute('src', this.icon);
      if (this.reply) {
        wrapper.classList.add('answer');
      } else {
        wrapper.classList.remove('answer');
      }
      if (this.playable) {
        for (const callback of playableCallbacks) callback();
        playableCallbacks.clear();
      }
    }
  }
  const state = {
    playing: new ChatroomState('Pause', 'img/icon/pause.png'),
    paused: new ChatroomState('Play', 'img/icon/play.png', false),
    waiting: new ChatroomState('Answer', 'img/icon/reply.png', false, true),
    done: new ChatroomState('End', 'img/icon/save.png', false),
  };
  state.playing.execute = () => state.paused.activate();
  state.paused.execute = () => state.playing.activate();
  state.waiting.execute = () => showReplies(stateCtx);
  state.done.execute = () => {}; // TODO Figure out what to actually do with this
  state.playing.activate();

  // reply stuff
  const replyCont = document.getElementById('reply-container');
  const replyList = document.getElementById('reply-list');
  function hideReplies() {
    replyCont.classList.remove('visible');
  }
  function showReplies(ctx) {
    let child;
    while (child = replyList.lastChild) replyList.removeChild(child);
    for (const [reply, events] of Object.entries(ctx.branches)) {
      const replyBox = document.createElement('div');
      replyBox.setAttribute('class', 'reply button');
      replyBox.innerHTML = `<div class="reply-body button-body">
    <span class="reply-text">${reply}</span>
</div>`;
      replyBox.onclick = () => {
        ctx.upstream.mc.send(reply);
        ctx.upstream.queue.unshift(...events);
        hideReplies();
        state.playing.activate();
        ctx.next();
      };

      replyList.appendChild(replyBox);
    }
    window.setTimeout(() => replyCont.classList.add('visible'));
  }
  document.getElementById('reply-visor').onclick = hideReplies;

  // message bar button behaviour
  const button = document.getElementById('msg-button');
  button.onclick = () => chatState.execute();

  // shake animation stuff
  let shakeTask;
  function doShake() {
    wrapper.classList.add('shake');
    if (shakeTask) window.clearTimeout(shakeTask);
    window.setTimeout(() => wrapper.classList.remove('shake'), 750);
  }

  // chatroom event stuff
  class MessengerEvent {
    constructor(duration = 400) {
      this.duration = duration;
    }

    execute() {
      throw new Error('No implementation!');
    }
  }
  class ChatEvent extends MessengerEvent {
    constructor(author, text, options = {}) {
      super(Math.max(text.length * 72, 750));
      this.author = author;
      this.text = text;
      this.options = options;
    }

    execute(ctx, next) {
      this.author.send(this.text.replace(/\bMC\b/g, ctx.mc.name), this.options);
      next();
    }
  }
  class JoinEvent extends MessengerEvent {
    constructor(author) {
      super();
      this.author = author;
    }

    execute(ctx, next) {
      this.author.sendJoin();
      ctx.members.add(this.author);
      updateName(ctx.members);
      next();
    }
  }
  class LeaveEvent extends MessengerEvent {
    constructor(author) {
      super();
      this.author = author;
    }

    execute(ctx, next) {
      this.author.sendLeave();
      ctx.members.delete(this.author);
      updateName(ctx.members);
      next();
    }
  }
  class BranchEvent extends MessengerEvent {
    constructor(branches) {
      super(0);
      this.branches = branches;
    }

    execute(ctx, next) {
      state.waiting.activate({upstream: ctx, branches: this.branches, next});
    }
  }

  // TODO load and parse chatroom script
  const script = {
    initialMembers: [rfa.yoosung, rfa.seven, rfa.jaehee, rfa.hyun],
    mc: {name: 'Eve'},
    background: 'night',
    video: 'COlXAgQ6Cu0',
  };
  const mc = new Member(script.mc.name || 'MC',
    script.mc.colour || 'ffffed',
    script.mc.avatar || 'img/avatar/mc.jpg',
    true);
  script.initialMembers.push(mc);
  script.events = [
    new ChatEvent(rfa.seven, 'cats are just very small very furry humans'),
    new ChatEvent(rfa.yoosung, 'wtf'),
    new BranchEvent({
      'i think he\'s onto something..': [
        new ChatEvent(rfa.yoosung, 'MC wtf'),
      ],
      'wtf': [
        new ChatEvent(rfa.yoosung, 'ikr'),
      ],
    }),
    new ChatEvent(rfa.hyun, 'I really didn\'t need to hear that;;;', {classes: ['curly']}),
    new ChatEvent(rfa.jaehee, 'Agreed.', {classes: ['serif', 'bold']}),
    new LeaveEvent(rfa.jaehee),
    new LeaveEvent(rfa.hyun),
    new ChatEvent(rfa.yoosung, 'hey, wait for me!!', {shake: true, classes: ['big']}),
    new LeaveEvent(rfa.yoosung),
    new ChatEvent(rfa.seven, 'why are you booing me? i\'m right', {classes: ['weird']}),
    new JoinEvent(rfa.ray),
    new ChatEvent(rfa.ray, 'I joined just to tell you that you\'re wrong'),
    new LeaveEvent(rfa.ray),
    new ChatEvent(rfa.seven, ':('),
    new LeaveEvent(rfa.seven),
  ];

  // script execution context
  const context = {
    mc,
    members: new Set(script.initialMembers),
    activeEvent: null,
    queue: [...script.events],
  };

  // execute script
  (bgs[script.background] || bgs.day).activate();
  function prepareExecute(notFirst = true) {
    if (!context.queue.length) {
      state.done.activate();
      return;
    }
    context.activeEvent = context.queue.shift();
    function execute(event) {
      if (!chatState.playable) {
        playableCallbacks.add(() => execute(event));
      } else {
        event.execute(context, prepareExecute);
      }
    }
    if (notFirst && context.activeEvent.duration > 0) {
      window.setTimeout(() => execute(context.activeEvent), context.activeEvent.duration);
    } else {
      execute(context.activeEvent);
    }
  }
  function go() {
    updateName(context.members);
    document.getElementById('loader').style.display = 'none';
    prepareExecute(false);
  }
  // if (script.video) {
  //   const iframe = document.getElementById('youtube-embed');
  //   iframe.addEventListener('load', go);
  //   iframe.src = `https://youtube.com/embed/${script.video}?autoplay=1&controls=0&loop=1&playlist=${script.video}`;
  // } else {
  //   go();
  // }
  go();

})();