var Chat = {
  channel_received: 0,
  all_received: 0,
  chat_admin_help: [
    "/ban USERNAME REASON to ban user",
    "/unban USERNAME to unban a user"
  ],
  chat_help: [
    "/login <new name> <password> to register and save a password for a nickname, or to log in with a password on a name.",
    "/login <name> <new_password> <old_password> to change the password on a nickname",
    "/logout to logout",
    "/who to see the names of the people in the channel",
    "Want your own icon besides your name? If you donate 5$ or more, we'll add a picture of your choosing (following our guidelines) besides your name!"
  ],

  namechange: function(data, first, initial) {
    var input = data.split(" ");
    if (input.length == 2) {
      var name = input[0];
      var password = input[1];

      password = Crypt.crypt_chat_pass(password);
      socket.emit("namechange", {
        name: name,
        channel: chan.toLowerCase(),
        password: password,
        first: first
      });
    } else if (input.length == 3) {
      var name = input[0];
      var new_password = input[1];
      var old_password = input[2];

      new_password = Crypt.crypt_chat_pass(new_password);
      old_password = Crypt.crypt_chat_pass(old_password);

      socket.emit("namechange", {
        name: name,
        channel: chan.toLowerCase(),
        new_password: new_password,
        old_password: old_password
      });
    } else if (first) {
      var to_send = { initial: initial, first: true };
      if (chan != undefined && chan != "") {
        to_send.channel = chan.toLowerCase();
      }
      socket.emit("namechange", to_send);
    }
  },

  removename: function() {
    socket.emit("removename", { channel: chan.toLowerCase() });
    Crypt.remove_name();
  },

  chat: function(data) {
    if (data.value.length > 150) return;
    if (
      data.value.startsWith("/name ") ||
      data.value.startsWith("/removename")
    ) {
      data.value = "/help";
      Chat.chat(data);
      return;
    } else if (data.value.startsWith("/login ")) {
      Chat.namechange(data.value.substring(7), false);
    } else if (data.value.startsWith("/help")) {
      var add = "";
      if (
        document.querySelector(".chat-tab-li a.active").getAttribute("href") ==
        "#all_chat"
      ) {
        if (document.querySelector("#chatall").children.length > 100) {
          document.querySelector("#chatall").children[0].remove();
        }
        add = "chatall";
      } else {
        if (document.querySelector("#chatchannel").children.length > 100) {
          document.querySelector("#chatchannel").children[0].remove();
        }
        add = "chatchannel";
      }
      var help = Chat.chat_help;
      if (Admin.logged_in) help = help.concat(Chat.chat_admin_help);
      for (var x = 0; x < help.length; x++) {
        var color = Helper.intToARGB(Helper.hashCode("System"));
        if (color.length < 6) {
          for (x = color.length; x < 6; x++) {
            color = "0" + color;
          }
        }
        var _time = new Date();
        var time =
          Helper.pad(_time.getHours()) + ":" + Helper.pad(_time.getMinutes());
        color = Helper.hexToRgb(color.substring(0, 6));
        var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
        document
          .querySelector("#" + add)
          .insertAdjacentHTML(
            "beforeend",
            "<li title='Zoff''><span class='time_color'>" +
              time +
              "</span> <img class='chat-icon' src='https://zoff.me/assets/images/favicon-32x32.png' alt='System'><span style='color:" +
              color_temp +
              ";'>System</span>: </li>"
          );
        var in_text = document.createTextNode(help[x]);
        document
          .querySelector("#" + add)
          .children[
            document.querySelector("#" + add).children.length - 1
          ].appendChild(in_text);
        document.getElementById("" + add).scrollTop = document.getElementById(
          "" + add
        ).scrollHeight;
      }
    } else if (data.value.startsWith("/logout")) {
      Chat.removename();
    } else if (
      document.querySelector(".chat-tab-li a.active").getAttribute("href") ==
      "#all_chat"
    ) {
      socket.emit("all,chat", {
        channel: chan.toLowerCase(),
        data: data.value
      });
    } else {
      socket.emit("chat", { channel: chan.toLowerCase(), data: data.value });
    }
    data.value = "";
    return;
  },

  createChatElement: function(
    allchat,
    channel,
    time,
    icon,
    color,
    from,
    message
  ) {
    var liElement = document.createElement("li");
    liElement.innerHTML +=
      "<span class='time_color'>" + time + "</span> " + icon;
    var nameElement = document.createElement("span");
    nameElement.innerText = from;
    nameElement.style.color = color;
    liElement.appendChild(nameElement);
    if (allchat) {
      liElement.title = channel;
      liElement.innerHTML +=
        "<span class='channel-info-all-chat'> " + channel + "</span>";
    }
    var in_text = document.createTextNode(message);
    liElement.appendChild(in_text);
    return liElement;
  },

  allchat: function(inp, time_sent, disable_blink) {
    if (inp.msg.substring(0, 1) == ":" && !chat_active && !disable_blink) {
      Chat.all_received += 1;
      document
        .querySelector("#favicon")
        .getAttribute("href", "/assets/images/highlogo.png");
      unseen = true;
      chat_unseen = true;
      Helper.removeClass(
        document.querySelector(".chat-link span.badge.new.white"),
        "hide"
      );
      var to_display =
        Chat.channel_received + Chat.all_received > 9
          ? "9+"
          : Chat.channel_received + Chat.all_received;
      Helper.setHtml(
        document.querySelector(".chat-link span.badge.new.white"),
        to_display
      );
    }

    if (document.hidden) {
      document
        .getElementById("favicon")
        .setAttribute("href", "/assets/images/highlogo.png");
    }

    if (document.querySelector("#chatall").children.length > 100) {
      document.querySelector("#chatall").children[0].remove();
    }
    var color = Helper.intToARGB(Helper.hashCode(inp.from));
    if (color.length < 6) {
      for (x = color.length; x < 6; x++) {
        color = "0" + color;
      }
    }
    var icon_add = "";
    if (inp.hasOwnProperty("icon") && inp.icon !== false && inp.icon != "") {
      icon_add =
        "<img class='chat-icon' src='" + inp.icon + "' alt='" + inp.from + "'>";
    }

    color = Helper.hexToRgb(color.substring(0, 6));
    var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
    var _time = new Date();
    if (time_sent) {
      _time = new Date(time_sent);
    }
    var time =
      Helper.pad(_time.getHours()) + ":" + Helper.pad(_time.getMinutes());
    var element = Chat.createChatElement(
      true,
      Helper.decodeChannelName(inp.channel),
      time,
      icon_add,
      color_temp,
      inp.from,
      inp.msg
    );
    //document.querySelector("#chatall").insertAdjacentHTML("beforeend", element);
    document.querySelector("#chatall").appendChild(element);
    if (!userscroll) {
      programscroll = true;
      document.getElementById("chatall").scrollTop = document.getElementById(
        "chatall"
      ).scrollHeight;
      programscroll = false;
    }
  },

  channelchat: function(data, time_sent, disable_blink) {
    if (
      data.msg.substring(0, 1) == ":" &&
      !chat_active &&
      !disable_blink &&
      data.from.toLowerCase() != "system"
    ) {
      document
        .querySelector("#favicon")
        .setAttribute("href", "/assets/images/highlogo.png");
      unseen = true;
      chat_unseen = true;
      Chat.channel_received += 1;
      //blink_interval = setTimeout(Chat.chat_blink, 1000);
      Helper.removeClass(
        document.querySelector(".chat-link span.badge.new.white"),
        "hide"
      );
      var to_display =
        Chat.channel_received + Chat.all_received > 9
          ? "9+"
          : Chat.channel_received + Chat.all_received;
      Helper.setHtml(
        document.querySelector(".chat-link span.badge.new.white"),
        to_display
      );
    }

    if (document.querySelector("#chatchannel").children.length > 100) {
      document.querySelector("#chatchannel").children[0].remove();
    }

    var icon_add = "";
    if (data.hasOwnProperty("icon") && data.icon !== false && data.icon != "") {
      icon_add =
        "<img class='chat-icon' src='" +
        data.icon +
        "' alt='" +
        data.from +
        "'>";
    }

    var color = Helper.intToARGB(Helper.hashCode(data.from));
    if (color.length < 6) {
      for (x = color.length; x < 6; x++) {
        color = "0" + color;
      }
    }
    color = Helper.hexToRgb(color.substring(0, 6));
    var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
    var _time = new Date();
    if (time_sent) {
      _time = new Date(time_sent);
    }
    var time =
      Helper.pad(_time.getHours()) + ":" + Helper.pad(_time.getMinutes());
    //document.querySelector("#chatchannel").insertAdjacentHTML("beforeend", "<li><span class='time_color'>" + time + "</span> " + icon_add + "<span style='color:"+color_temp+";'>"+data.from+"</span></li>");
    //var in_text = document.createTextNode(data.msg);
    //document.querySelector("#chatchannel").children[document.querySelector("#chatchannel").children.length - 1].appendChild(in_text);
    var element = Chat.createChatElement(
      false,
      null,
      time,
      icon_add,
      color_temp,
      data.from,
      data.msg
    );
    //document.querySelector("#chatall").insertAdjacentHTML("beforeend", element);
    document.querySelector("#chatchannel").appendChild(element);

    if (!userscroll) {
      programscroll = true;
      document.getElementById(
        "chatchannel"
      ).scrollTop = document.getElementById("chatchannel").scrollHeight;
      programscroll = false;
    }
  }
};
