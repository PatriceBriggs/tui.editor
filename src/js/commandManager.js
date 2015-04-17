/**
 * @fileoverview
 * @author FE개발팀 김성호 sungho-kim@nhnent.com
 */

'use strict';

var util = ne.util,
    CodeMirror = window.CodeMirror;

/**
 * CommandManager
 * @exports CommandManager
 * @extends {}
 * @constructor
 * @class
 * @param {NEditor} base ned인스턴스
 */
function CommandManager(base) {
    this._command = new util.HashMap();
    this._mdCommand = new util.HashMap();
    this.base = base;

    this._linkWithEventManager();
}

/**
 * addCommand
 * 커맨드를 추가한다.
 * @param {Command} command 커맨드객체
 */
CommandManager.prototype.addCommand = function(command) {
    var base = this.base,
        responder = command.responder,
        name = command.getName();

    if (command.isMDType()) {
        this._addCMCommand(name, responder, command.keyMap);
        this._mdCommand.set(name, function() {
           return responder.apply(null, [base.getCodeMirror()].concat(util.toArray(arguments)));
        });
    } else if (command.isGlobalType()) {
        this._command.set(name, responder);
    }
};

CommandManager.prototype._addCMCommand = function(name, fn, keyMap) {
    if (!CodeMirror.commands[name]) {
        CodeMirror.commands[name] = fn;

        if (keyMap) {
            CodeMirror.keyMap.pcDefault[keyMap[0]] = name;
            CodeMirror.keyMap.macDefault[keyMap[1]] = name;
        }
    }
};

/**
 * 커맨드를 실행한다
 * @param {String} name 커맨드명
 * @returns {*} 커맨드를 수행한후 리턴값
 */
CommandManager.prototype.exec = function(name) {
    var command = this._command.get(name),
        mdCommand = this._mdCommand.get(name),
        args = util.toArray(arguments);

    args.shift();

    //todo 상황별로 판단하는 로직이 필요
    if (command) {
        return command();
    } else if (mdCommand) {
        return mdCommand.apply(null, args);
    }
};

CommandManager.prototype._linkWithEventManager = function() {
    var commandManager = this;

    this.base.eventManager.listen('command', function(command) {
        commandManager.exec(command);
    });
};

module.exports = CommandManager;
