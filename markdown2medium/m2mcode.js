function tryPost(btn) {
    $('.alert').addClass("d-none");
    $('.alert').removeClass("alert-danger");
    $('.alert').removeClass("alert-success");
    if (!validate()) return;

    $( btn ).prop("disabled", true);
    $( btn ).html($( btn ).html().replace("Convert", "Converting..."));
    $( btn ).children("span").removeClass('d-none');
    clearLog();
    appendLog("Getting Medium user ID...");
    auth = $('#apiKey').prop("value")

    proxyFetch("https://cors.root.workers.dev/", "https://api.medium.com/v1/me", {
      method: "get",
      headers: {
        "Authorization": "Bearer " + auth,
        "Content-type": "application/json",
        "Accept": "application/json",
        "Accept-Charset": "utf-8",
      }
    }).then(response => status(response, gotId, "Failed to retrieve user id")).catch(_ => error("Failed to contact the API"));
  }

  function markValid(item, isValid) {
    if (isValid) {
      item.addClass('is-valid');
      item.removeClass('is-invalid');
    } else {
      item.addClass('is-invalid');
      item.removeClass('is-valid');
    }
  }

  function validate() {
    markValid($('#postTitle'), $('#postTitle').prop("value") !== "");
    markValid($('#markdownText'), $('#markdownText').prop("value") !== "");
    markValid($('#apiKey'), $('#apiKey').prop("value").match("[A-fa-f0-9]{65}"));
    markValid($('#corsProxy'), $('#corsProxy').prop("value") !== "" && $('#corsProxy').prop("validity").valid);

    return $('.is-invalid').length == 0;
  }

  function proxyFetch(proxyurl, url, init) {
    init['headers']['X-Corsify-Url'] = url;
    init['mode'] = 'cors'

    return fetch(proxyurl, init)
  }

  function error(err) {
    appendLog(err);
    $('.alert').html(err);
    $('.alert').addClass("alert-danger");
    $('.alert').removeClass("d-none");
    reset();
  }

  function status(response, next, err) {
    if (response.status >= 200 && response.status < 300) {
      response.json().then(next);
    } else {
      let status = response.status;
      if (status == 401)
        status = "unauthorized";
      error("Failed to retrieve user id: " + status);
    }
  }

  function gotId(data) {
    if ("data" in data) {
      if ("id" in data['data'] && "username" in data['data']) {
        appendLog("Publishing for user " + data['data']['username'] + "...");
        createPost(data['data']['id']);
        return;
      }
    }

    error("Invalid response from the API");
  }

  function createPost(id) {
    let postUrl = "https://api.medium.com/v1/users/" + id + "/posts";
    let postData = {
      "title": $('#postTitle').prop("value"),
      "contentFormat": "markdown",
      "content": $('#markdownText').prop("value"),
      "publishStatus": "draft",
    }

    proxyFetch("https://cors.root.workers.dev/", postUrl, {
      method: "post",
      headers: {
        "Authorization": "Bearer " + $('#apiKey').prop("value"),
        "Content-type": "application/json",
        "Accept": "application/json",
        "Accept-Charset": "utf-8",
      },
      body: JSON.stringify(postData),
    }).then(response => status(response, gotPostData, "Failed to publish the post")).catch(_ => error("Failed to contact the API"));
  }

  function doSuccess(title, postUrl) {
    appendLog("Published " + title + " at " + postUrl);
    $('.alert').html('Published <strong>' + title + '</strong> at <a href="' + postUrl + '" class="alert-link">' + postUrl + '</a>');
    $('.alert').addClass("alert-success");
    $('.alert').removeClass("d-none");
  }

  function gotPostData(data) {
    if ("data" in data) {
      if ("title" in data['data'] && "url" in data['data']) {
        doSuccess(data['data']['title'], data['data']['url']);
        reset();
        return;
      }
    }

    error("Invalid response from the API");
  }

  function appendLog(str) {
    document.getElementById("logText").value += str + "\n";
  }

  function clearLog() {
    document.getElementById("logText").value = "";
  }

  function reset() {
    let btn = $('#convertBtn');
    btn.html(btn.html().replace("Converting...", "Convert"));
    btn.children("span").addClass('d-none');
    btn.prop("disabled", false);
  }