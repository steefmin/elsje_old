var formatUptime = function (uptime) {
  var unit = 'seconde'
  var days
  if (uptime >= 1.5) {
    unit = unit + 'n'
  }
  if (uptime > 60) {
    uptime = uptime / 60
    unit = 'minuut'
    if (uptime >= 1.5) {
      unit = 'minuten'
    }
    if (uptime > 60) {
      uptime = uptime / 60
      unit = 'uur'
      if (uptime > 24) {
        days = uptime / 24
        unit = 'dag'
        if (uptime >= 1.5) {
          unit = unit + 'en'
        }
      }
    }
  }
  if (days) {
    uptime = Math.floor(days) + ' ' + unit + ' en ' + Math.round(uptime - Math.floor(days) * 24) + ' uur'
  } else {
    uptime = Math.round(uptime) + ' ' + unit
  }
  return uptime
}

var verifyDate = function (text) {
  var date = new Date()
  var currentDate = date
  if (regexp(/vandaag\s*/i, text)) {
  } else if (regexp(/morgen\s*/i, text)) {
    date.setDate(date.getDate() + 1)
  } else if (regexp(/week\s*/i, text)) {
    date.setDate(date.getDate() + 7)
  } else if (regexp(/maand\s*/i, text)) {
    date.setDate(date.getDate() + 30)
  } else {
    date = parseDate(text)
  }
  if (date !== 'Invalid Date' && date.getTime() >= currentDate.getTime()) {
    return date.toISOString().substr(0, 10)
  } else {
    return false
  }
}

var parseDate = function (text) {
  text = text.replace(/-/g, '/')
  var split = text.split('/')
  if (typeof split[1] !== 'undefined' && typeof split[2] !== 'undefined') {
    text = split[1] + '/' + split[0] + '/' + split[2]
  }
  text = text.replace('maa', 'mar')
  text = text.replace('mei', 'may')
  text = text.replace('okt', 'oct')
  var date = new Date(Date.parse(text))
  date.setDate(date.getDate() + 1)
  return date
}

var addSpaces = function (numberOfSpaces) {
  var spaces = ''
  for (var i = 0; i < numberOfSpaces; i++) {
    spaces += ' '
  }
  return spaces
}

var verifyUserName = function (input) {
  var patern = /<@.{9}>/
  var userid = patern.exec(input)
  if (userid) {
    userid = userid[0].substr(2, 9)
  }
  return userid
}

var verifyChannelName = function (input) {
  var patern = /<#.{9}/
  var channelid = patern.exec(input)
  if (channelid) {
    channelid = channelid[0].substr(2, 9)
  }
  return channelid
}

var verifyUserId = function (input) {
  var patern = /U.{8}/
  var userid = patern.exec(input)
  if (userid) {
    return userid[0]
  } else {
    return false
  }
}

var verifyChannelId = function (input) {
  var patern = /C.{8}/
  var channelid = patern.exec(input)
  if (channelid) {
    return channelid[0]
  } else {
    return false
  }
}

var regexp = function (patern, string) {
  if (patern.exec(string)) {
    return true
  } else {
    return false
  }
}

var getBotImg = function (bot, callback) {
  bot.api.users.info({'user': bot.identity.id}, function (err, reply) {
    if (!err) {
      callback(reply.user.profile.image_original)
    }
  })
}

var getTeamId = function (bot, callback) {
  bot.api.users.info({'user': bot.identity.id}, function (err, reply) {
    if (!err) {
      callback(reply.user.team_id)
    }
  })
}

var filterTasks = function (filterOn, tasks, filterFor) {
  if (filterFor === 'all') {
    return tasks
  } else {
    return tasks.filter(function (val) {
      return val[filterOn] === filterFor
    })
  }
}

var sortTasks = function (tasks, sortBy) {
  var sorted = tasks.sort(function (taska, taskb) {
    if (taska[sortBy] < taskb[sortBy]) {
      return 1
    }
    if (taska[sortBy] > taskb[sortBy]) {
      return -1
    }
    return 0
  })
  return sorted
}

var formatTasks = function (tasks) {
  var formatted = 'Takenlijst\n```'
  tasks.forEach(function (task, index, array) {
    var addtostring = ''
    var deadline = new Date(task.deadline)
    if (task.status !== 'done') {
      addtostring =
        '<#' + task.channel + '>' +
        addSpaces(2) +
        task.taskid +
        addSpaces(4 - task.taskid.toString().length) +
        '<@' + task.responsibleid + '>' +
        addSpaces(2) +
        deadline +
        addSpaces(2) +
        task.task +
        '\n'
      formatted += addtostring
    }
  })
  formatted += '```'
  return formatted
}

var postMessage = function (bot, message, channel) {
  getBotImg(bot, function (image) {
    bot.api.chat.postMessage({
      'channel': channel,
      'text': message,
      'username': bot.identity.name,
      'icon_url': image
    })
  })
}

var postAttachment = function (bot, attachmentArray, channel) {
  getBotImg(bot, function (image) {
    bot.api.chat.postMessage({
      'channel': channel,
      'attachments': attachmentArray,
      'username': bot.identity.name,
      'icon_url': image
    })
  })
}

var postSingleTask = function (bot, taskStructure, message) {
  console.log(taskStructure)
  if (typeof message.color === 'undefined') {
    message.color = '#3090C7'
  }
  if (typeof message.fallback === 'undefined') {
    message.fallback = message.pretext
  }
  var status = taskStructure.status === 0 ? 'new' : 'done'
  var attachmentArray = [{
    'fallback': message.fallback,
    'color': message.color,
    'pretext': message.pretext,
    'fields': [
      {
        'title': 'Taak',
        'value': taskStructure.task,
        'short': false
      },
      {
        'title': 'Verantwoordelijke',
        'value': '<@' + taskStructure.responsibleid + '>',
        'short': true
      },
      {
        'title': 'Status',
        'value': status,
        'short': true
      },
      {
        'title': 'Deadline',
        'value': taskStructure.deadline,
        'short': true
      },
      {
        'title': 'Taaknummer',
        'value': taskStructure.taskid,
        'short': true
      }
    ]
  }]
  postAttachment(bot, attachmentArray, taskStructure.channel)
}

var sendScore = function (bot, userId, score, channel) {
  var plural = ''
  if (Math.abs(score) > 1 || score === 0) {
    plural = 'en'
  }
  var smiley = getScoreSmiley(score)
  var attachment = [{
    'fallback': '<@' + userId + '> heeft nu ' + score + ' punt' + plural + ' ' + smiley,
    'text': ' <@' + userId + '> heeft nu ' + score + ' punt' + plural + ' ' + smiley
  }]
  if (score > 0) {
    attachment.color = 'good'
  }
  if (score < 0) {
    attachment.color = 'danger'
  }
  postAttachment(bot, attachment, channel)
}

var getScoreSmiley = function (score) {
  var high = 100
  var low = -20
  if (score > high) {
    score = high
  }
  if (score < low) {
    score = low
  }
  var positiveSmileys = [
    ':slightly_smiling_face:',
    ':grinning:',
    ':dizzy_face:',
    ':the_horns:',
    ':heart_eyes:'
  ]
  var negativeSmileys = [
    ':slightly_frowning_face:',
    ':cry:',
    ':sob:',
    ':confounded:',
    ':scream:',
    ':ghost:'
  ]
  var relativeScore
  if (score > 0) {
    relativeScore = Math.round((positiveSmileys.length - 1) / (high) * (score - 1))
    return positiveSmileys[relativeScore]
  } else if (score < 0) {
    relativeScore = Math.round((negativeSmileys.length - 1) / (-low - 1) * (-score - 1))
    return negativeSmileys[relativeScore]
  } else {
    return ':no_mouth:'
  }
}

module.exports = {
  formatUptime: formatUptime,
  verifyDate: verifyDate,
  addSpaces: addSpaces,
  verifyUserId: verifyUserId,
  verifyChannelId: verifyChannelId,
  verifyUserName: verifyUserName,
  verifyChannelName: verifyChannelName,
  regexp: regexp,
  getBotImg: getBotImg,
  getTeamId: getTeamId,
  formatTasks: formatTasks,
  sortTasks: sortTasks,
  filterTasks: filterTasks,
  postMessage: postMessage,
  postAttachment: postAttachment,
  postSingleTask: postSingleTask,
  sendScore: sendScore
}
