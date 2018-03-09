# Mystic Mess
it's a party on the interwebs

## Introduction
**Mystic Mess** is a rudimentary chatroom emulator for the otome game [Mystic Messenger](http://cheritz.com/games/mystic-messenger). It reads scripts describing the interactions between characters and plays them out like a chatroom. It's not quite one-to-one with the actual game's implementation of chatrooms, but it's close enough to provide a similar experience with user-created content.

## So How Do I Use This Thing?
Mystic Mess is able to (or will be able to at some point in the future) load scripts from multiple different sources. The type and location of the script to load is specified using the URL query parameters `type` and `url` respectively. For example, suppose you wanted to load [this Tumblr post](http://phantamanta44.tumblr.com/post/171613976399/707-enters-the-chat-room) as a script. You would copy the post's permalink URL and pass it via the `url` parameter, setting the `type` parameter as necessary:
```
/?type=tumblr&url=http://phantamanta44.tumblr.com/post/171613976399/707-enters-the-chat-room
```
Note that the `url` parameter can be URL-encoded if you so wish.

## Where Can I Load Scripts From?
Currently implemented are the following script sources:

### Tumblr Chat Posts
Mystic Mess can parse Tumblr chat posts where the participants are Mystic Messenger characters. This offers considerably less flexibility than other script sources because you're forced to adhere to Tumblr's relatively restricted chat format and you don't have the opportunity to provide other metadata about the chat. In order to load a Tumblr chat post, you'll need to pass `type=tumblr` and the permalink to whatever post as the `url`.

For example, this is how you might load [this post](http://phantamanta44.tumblr.com/post/171613976399/707-enters-the-chat-room):
```
/?type=tumblr&url=http://phantamanta44.tumblr.com/post/171613976399/707-enters-the-chat-room
```

### Direct Script Files
Mystic Mess can read files from some location on the internet directly and parse them using a [special script syntax](https://github.com/rfassoc/MysticMess/blob/master/docs/script-syntax.md). In order to load these script files, you'll need to pass `type=direct` and the direct link to your script file as the `url`.

For example, this is how you might load [this script file](https://gist.githubusercontent.com/phantamanta44/694c23acb6d4e8cb62120e0e9c7c906c/raw/demo4.txt):
```
/?type=direct&url=https://gist.githubusercontent.com/phantamanta44/694c23acb6d4e8cb62120e0e9c7c906c/raw/demo4.txt
```

### Direct JSON Script Files
To be implemented...!

## Can I Get Heart Data as a Callback?
Uhhhhhhhhhhhhh....... not yet.

## What Kinds of Data are Available?
Various features of Mystic Mess might require some extra external data. All that available data is indexed below.

### Characters
* seven
* jaehee
* yoosung
* hyun
* jumin
* jihyun
* rika
* unknown
* saeran

Characters can also be referred to by their chatroom names (e.g. `zen` instead of `hyun`).

### Emotes
* seven confuse
* seven frustrate
* seven happy
* seven love
* seven sad
* seven star
* seven success
* seven surprise
* seven wtf
* jaehee angry
* jaehee confuse
* jaehee cry
* jaehee happy
* jaehee sad
* jaehee star
* jaehee success
* jaehee surprise
* jaehee wtf
* yoosung angry
* yoosung confuse
* yoosung cry
* yoosung happy
* yoosung love
* yoosung sad
* yoosung star
* yoosung success
* yoosung surprise
* yoosung wtf
* hyun angry
* hyun confuse
* hyun cry
* hyun happy
* hyun love
* hyun sad
* hyun star
* hyun surprise
* hyun wtf
* jumin angry
* jumin cry
* jumin happy
* jumin wtf

These can all be found in the [`img/emote` directory](https://github.com/rfassoc/MysticMess/tree/master/img/emote).

### Backgrounds
* day
* night
* dawn
* noon
* dusk
* code

These can all be found in the [`img/bg` directory](https://github.com/rfassoc/MysticMess/tree/master/img/bg).

## Can I Abuse Yoosung?
pls don't he's a good boy :(