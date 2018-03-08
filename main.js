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
  const availableEmotes = {
    seven: ['confuse', 'frustrate', 'happy', 'love', 'sad', 'star', 'success', 'surprise', 'wtf'],
    jaehee: ['angry', 'confuse', 'cry', 'happy', 'sad', 'star', 'success', 'surprise', 'wtf'],
    yoosung: ['angry', 'confuse', 'cry', 'happy', 'love', 'sad', 'star', 'success', 'surprise', 'wtf'],
    hyun: ['angry', 'confuse', 'cry', 'happy', 'love', 'sad', 'star', 'surprise', 'wtf'],
    jumin: ['angry', 'cry', 'happy', 'wtf'],
  };
  class Member {
    constructor(name, colour, avatar, right = false) {
      this.name = name;
      this.lcname = name.toLowerCase();
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

    sendEmote(name) {
      return sendMsg(this, `<div class="msg-emote">
    <img class="emote" src="img/emote/${this.key}/${name}.gif"/>
</div>`);
    }

    sendImage(url) {
      return sendMsg(this, `<div class="msg-chat-image">
    <img class="chat-image" src="${url}"/>
</div>`);
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
    unknown: new Member('Unknown', 'f3e6fa', 'img/avatar/question.jpg'),
    saeran: new Member('Ray', 'f3e6fa', 'img/avatar/question.jpg'),
  };
  for (const key of Object.keys(rfa)) rfa[key].key = key;
  rfa.findMember = name => rfa[name] || Object.values(rfa).find(m => m.lcname === name);

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
  class EmoteEvent extends MessengerEvent {
    constructor(author, name) {
      super(500);
      this.author = author;
      this.name = name;
    }

    execute(ctx, next) {
      this.author.sendEmote(this.name);
      next();
    }
  }
  class ImageEvent extends MessengerEvent {
    constructor(author, url) {
      super(1000);
      this.author = author;
      this.url = url;
    }

    execute(ctx, next) {
      this.author.sendImage(this.url);
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

  // parse url query
  const query = {};
  for (const entry of document.location.search.substring(1).split('&')) {
    const delimIndex = entry.indexOf('=');
    if (~delimIndex) query[entry.substring(0, delimIndex)] = entry.substring(delimIndex + 1);
  }

  function executeScript(script) {
    const mc = new Member(script.mc.name || 'MC',
      script.mc.colour || 'ffffed',
      script.mc.avatar || 'img/avatar/mc.jpg',
      true);
    script.initialMembers.push(mc);
    const context = {
      mc,
      members: new Set(script.initialMembers),
      activeEvent: null,
      queue: [...script.events],
    };
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
    if (script.video) {
      const iframe = document.getElementById('youtube-embed');
      iframe.addEventListener('load', go);
      iframe.src = `https://youtube.com/embed/${script.video}?autoplay=1&controls=0&loop=1&playlist=${script.video}`;
    } else {
      go();
    }
  }

  // determine script location and type then load script
  const loaderText = document.getElementById('loader-text');
  if (!query.type) {
    loaderText.innerText = 'No script type specified';
  } else if (!query.url) {
    loaderText.innerText = 'No script URL specified';
  } else {
    let processUrl = (url => url), parse;
    switch (query.type.toLowerCase()) {
      // tumblr parser
      case 'tumblr':
        processUrl = url => {
          const u = new URL(url);
          return `https://crossorigin.me/https://${u.host}/api/read/json?id=${u.pathname.split('/').find(p => /^\d+$/.test(p))}&filter=text`;
        };
        parse = data => {
          const post = JSON.parse(data.trim().substring(22, data.length - 2)).posts[0];
          if (post.type !== 'conversation') throw new Error('Only chat posts can be parsed');
          const script = {mc: {}, events: []};
          const characters = new Set();
          let seenMc = false;
          for (let {name, phrase} of post.conversation) {
            name = name.toLowerCase();
            const author = rfa.findMember(name);
            if (!author) {
              if (name !== 'me' && name !== 'mc') {
                if (name !== script.mc.name && seenMc) throw new Error(`At least one unknown character: ${name}`);
                script.mc.name = name;
              }
              seenMc = true;
            } else {
              characters.add(author);
            }
            script.events.push(new ChatEvent(author, phrase));
          }
          script.initialMembers = [...characters];
          return script;
        };
        break;

      // standard script file parser
      case 'direct':
        parse = data => {
          const script = {mc: {}, events: []};
          data = data.split('\n');
          const sectionDelim = data.findIndex(l => l.trim() === '---');
          if (sectionDelim === -1) throw new Error('No script section');
          for (let i = 0; i < sectionDelim; i++) {
            const delim = data[i].indexOf(':');
            if (delim === -1) throw new Error('Meta line without delimiter');
            const value = data[i].substring(delim + 1).trim();
            switch (data[i].substring(0, delim).trim()) {
              case 'mc.name':
                script.mc.name = value;
                break;
              case 'mc.colour':
                script.mc.colour = value;
                break;
              case 'mc.avatar':
                script.mc.avatar = value;
                break;
              case 'video':
                script.video = value;
                break;
              case 'members':
                script.initialMembers = value.split(',').map(n => rfa.findMember(n.trim().toLowerCase()));
                break;
              case 'background':
                script.background = value;
                break;
            }
          }
          data = data.slice(sectionDelim + 1);
          let n = 0;
          (function parseAtLevel(level, events) {
            const prefix = ' '.repeat(level);
            let branches = null;
            while (true) {
              let line = data[n];
              if (!line || !line.startsWith(prefix)) break;
              line = line.trim();
              n++;
              if (branches) {
                if (line === '$') {
                  events.push(new BranchEvent(branches));
                  branches = null;
                } else {
                  const branch = [];
                  parseAtLevel(level + 1, branch);
                  branches[line] = branch;
                }
              } else if (line === '^') {
                branches = {};
              } else if (line.startsWith('+')) {
                const name = line.substring(1);
                const person = rfa.findMember(name.toLowerCase());
                if (!person) throw new Error(`Invalid character joining: ${name}`);
                events.push(new JoinEvent(person));
              } else if (line.startsWith('-')) {
                const name = line.substring(1);
                const person = rfa.findMember(name.toLowerCase());
                if (!person) throw new Error(`Invalid character leaving: ${name}`);
                events.push(new LeaveEvent(person));
              } else {
                let parsed = /^(\w+)(?:\|([^:]+))?:(.+)$/.exec(line);
                if (parsed) { // it's a chat message
                  const options = {classes: []};
                  if (parsed[2]) {
                    for (let char of parsed[2]) {
                      switch (char) {
                        case 'c':
                          options.classes.push('curly');
                          break;
                        case 's':
                          options.classes.push('serif');
                          break;
                        case 'b':
                          options.classes.push('bold');
                          break;
                        case 'h':
                          options.classes.push('big');
                          break;
                        case '!':
                          options.shake = true;
                          break;
                        case 'w':
                          options.classes.push('weird');
                          break;
                      }
                    }
                  }
                  const author = rfa.findMember(parsed[1].toLowerCase());
                  const text = parsed[3].trim();
                  events.push(new ChatEvent(author, text, options));
                } else if (parsed = /^(\w+)!(\w+)$/.exec(line)) { // it's an emoji
                  const name = parsed[1].toLowerCase();
                  const author = rfa.findMember(name);
                  if (!author) throw new Error(`Invalid character emoting: ${name}`);
                  const emote = parsed[2];
                  if (!availableEmotes.hasOwnProperty(author.key) || !availableEmotes[author.key].includes(emote)) {
                    throw new Error(`Invalid emote: ${author.name} ${emote}`);
                  }
                  events.push(new EmoteEvent(author, emote));
                } else if (parsed = /^(\w+)&(.+)$/.exec(line)) { // it's an image
                  const name = parsed[1].toLowerCase();
                  const author = rfa.findMember(name);
                  if (!author) throw new Error(`Invalid character sending image: ${name}`);
                  events.push(new ImageEvent(author, parsed[2]));
                } else { // no clue what it is
                  throw new Error(`Unparsable line: ${line}`);
                }
              }
            }
          })(0, script.events);
          return script;
        };
        break;

      // json script parser
      case 'json':
        parse = data => {
          throw new Error('This format isn\'t implemented yet');
        };
        break;

      // no parser
      default:
        throw new Error('Invalid parser type');
    }
    const req = new XMLHttpRequest();
    try {
      req.open('GET', processUrl(decodeURIComponent(query.url)), true);
    } catch (e) {
      console.error(e);
      loaderText.innerText = e.message;
      return;
    }
    req.onload = () => {
      if (req.status >= 400) {
        loaderText.innerText = `${req.status}: ${req.responseText}`;
      } else {
        try {
          executeScript(parse(req.responseText));
        } catch (e) {
          console.error(e);
          loaderText.innerText = e.message;
        }
      }
    };
    req.onerror = () => {
      loaderText.innerText = 'Failed to load script';
    };
    req.send();
  }

})();
