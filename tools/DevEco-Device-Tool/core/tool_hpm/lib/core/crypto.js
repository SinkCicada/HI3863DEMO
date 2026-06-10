"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _helpers = require("../utils/helpers");

var _constant = require("../constant/constant");

var _log = _interopRequireDefault(require("./log"));

var _i18n = require("../i18n");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
 * Copyright (c) 2020-2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Crypto = {
  digest: function digest(path) {
    var buffer = _fs["default"].readFileSync(path);

    var fsHash = _crypto["default"].createHash('sha256');

    fsHash.update(buffer);
    var digest = fsHash.digest('hex');
    return digest;
  },
  sign: function sign(data, passphrase) {
    var privateKey = Crypto.getKey('private').toString('utf8');
    var opt = {
      key: Crypto.aesDecrypt(privateKey),
      padding: _crypto["default"].constants.RSA_PKCS1_PSS_PADDING,
      saltLength: _crypto["default"].constants.RSA_PSS_SALTLEN_DIGEST
    };

    if (passphrase) {
      opt.passphrase = passphrase;
    }

    var sign = _crypto["default"].createSign('RSA-SHA256');

    sign.update(data);
    return sign.sign(opt).toString('base64');
  },
  getKey: function getKey(mode) {
    // mode: private | public
    var user = (0, _helpers.getLoginUser)();

    var folder = _path["default"].join(_constant.DEFAULT_CONFIG_DIR, 'key');

    var name = mode === 'private' ? 'privateKey' : 'publicKey';
    var fileSuffix = /[a-zA-Z0-9-_\u4e00-\u9fa5]+/g.exec(user);

    var key = _path["default"].join(folder, "".concat(name).concat(fileSuffix ? "_".concat(fileSuffix) : '', ".pem"));

    if (!_fs["default"].existsSync(key)) {
      throw (0, _i18n.getI18nMessage)('crypto.keymissing', {
        key: key
      });
    }

    _log["default"].info("read ".concat(mode, " key: ").concat(key));

    return _fs["default"].readFileSync(key);
  },
  generateKeyPair: function generateKeyPair(_ref) {
    var passphrase = _ref.passphrase,
        _ref$user = _ref.user,
        user = _ref$user === void 0 ? (0, _helpers.getLoginUser)() : _ref$user,
        _ref$isLog = _ref.isLog,
        isLog = _ref$isLog === void 0 ? true : _ref$isLog,
        _ref$isAesGcm = _ref.isAesGcm,
        isAesGcm = _ref$isAesGcm === void 0 ? false : _ref$isAesGcm;

    var folder = _path["default"].join(_constant.DEFAULT_CONFIG_DIR, 'key');

    if (!_fs["default"].existsSync(folder)) {
      (0, _helpers.runShellCmd)(function (shell) {
        return shell.mkdir('-p', folder);
      });
    }

    var privateKeyEncoding = {
      type: 'pkcs8',
      format: 'pem'
    };

    if (passphrase) {
      privateKeyEncoding.cipher = 'aes-256-cbc';
      privateKeyEncoding.passphrase = passphrase;
    }

    var _crypto$generateKeyPa = _crypto["default"].generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: privateKeyEncoding
    }),
        publicKey = _crypto$generateKeyPa.publicKey,
        privateKey = _crypto$generateKeyPa.privateKey;

    var fileSuffix = /[a-zA-Z0-9-_\u4e00-\u9fa5]+/g.exec(user);

    var privatePath = _path["default"].join(folder, "privateKey".concat(fileSuffix ? "_".concat(fileSuffix) : '', ".pem"));

    var publicPath = _path["default"].join(folder, "publicKey".concat(fileSuffix ? "_".concat(fileSuffix) : '', ".pem"));

    var encryptedKey = '';

    if (isAesGcm) {
      encryptedKey = Crypto.aesGcmEncrypt(privateKey);
    } else {
      encryptedKey = Crypto.aesEncrypt(privateKey);
    }

    _fs["default"].writeFileSync(privatePath, encryptedKey, 'utf8');

    if (isLog) {
      _log["default"].info("generate private key: ".concat(privatePath));
    }

    _fs["default"].writeFileSync(publicPath, publicKey, 'utf8');

    if (isLog) {
      _log["default"].info("generate public key: ".concat(publicPath));
    }
  },
  privateEncrypt: function privateEncrypt(buffer, passphrase) {
    var privateKey = Crypto.getKey('private').toString('utf8');
    var opt = {
      key: Crypto.aesDecrypt(privateKey)
    };

    if (passphrase) {
      opt.passphrase = passphrase;
    }

    var encryptContent = _crypto["default"].privateEncrypt(opt, buffer);

    _log["default"].info('use private key encrypt');

    return encryptContent;
  },
  publicDecrypt: function publicDecrypt(buffer) {
    var publicKey = Crypto.getKey('public');

    var decryptContent = _crypto["default"].publicDecrypt({
      key: publicKey
    }, buffer);

    _log["default"].info('use public key decrypt');

    return decryptContent;
  },
  aesEncrypt: function aesEncrypt(data) {
    var mac = ((0, _helpers.getMacAddrs)()[0] || '').padEnd(24, 0);
    var nonce = Buffer.alloc(16, 0);

    var cipher = _crypto["default"].createCipheriv('aes192', mac, nonce);

    var encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher["final"]('hex');
    return encrypted;
  },
  aesDecrypt: function aesDecrypt(data) {
    var nonce = Buffer.alloc(16, 0);
    var macs = (0, _helpers.getMacAddrs)();
    var decrypted = '';

    for (var i = 0; i < macs.length; i += 1) {
      try {
        var m = macs[i].padEnd(24, '0');

        var decipher = _crypto["default"].createDecipheriv('aes192', m, nonce);

        decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher["final"]('utf8');

        if (decrypted) {
          break;
        }
      } catch (error) {
        decrypted = "";
      }
    }

    if (!decrypted) {
      throw (0, _i18n.getI18nMessage)('crypto.aesError');
    }

    return decrypted;
  },
  proxyEncrypt: function proxyEncrypt(data) {
    var publicPath = _path["default"].resolve(_constant.DEFAULT_CONFIG_DIR, 'key', 'publicKey_proxy.pem');

    if (!_fs["default"].existsSync(publicPath)) {
      Crypto.generateKeyPair({
        user: 'proxy',
        isLog: false,
        isAesGcm: true
      });
    }

    var key = _fs["default"].readFileSync(publicPath);

    var encryptContent = _crypto["default"].publicEncrypt({
      key: key,
      padding: _crypto["default"].constants.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(data, 'utf8'));

    return encryptContent.toString('hex');
  },
  proxyDecrypt: function proxyDecrypt(data) {
    var privatePath = _path["default"].resolve(_constant.DEFAULT_CONFIG_DIR, 'key', 'privateKey_proxy.pem');

    if (!_fs["default"].existsSync(privatePath)) {
      Crypto.generateKeyPair({
        user: 'proxy',
        isLog: false,
        isAesGcm: true
      });
    }

    var buffer = Buffer.from(_fs["default"].readFileSync(privatePath, 'utf8'), 'hex');
    var key = Crypto.aesGcmDecrypt(buffer);

    var encryptContent = _crypto["default"].privateDecrypt({
      key: key,
      padding: _crypto["default"].constants.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(data, 'hex'));

    return encryptContent.toString('utf8');
  },
  aesGcmEncrypt: function aesGcmEncrypt(data) {
    var mac = ((0, _helpers.getMacAddrs)()[0] || '').padEnd(24, 0);
    var iv = Buffer.alloc(16, 0);

    var cipher = _crypto["default"].createCipheriv('aes-192-gcm', mac, iv);

    var encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher["final"]('hex');
    encrypted += cipher.getAuthTag().toString('hex');
    return encrypted;
  },
  aesGcmDecrypt: function aesGcmDecrypt(buffer) {
    var macs = (0, _helpers.getMacAddrs)();
    var iv = Buffer.alloc(16);
    var ciphertext = buffer.slice(0, buffer.length - 16);
    var tag = buffer.slice(buffer.length - 16);
    var decrypted = null;

    for (var i = 0; i < macs.length; i += 1) {
      try {
        var m = macs[i].padEnd(24, '0');

        var decipher = _crypto["default"].createDecipheriv('aes-192-gcm', m, iv);

        decipher.setAuthTag(tag);
        decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher["final"]('utf8');

        if (decrypted) {
          break;
        }
      } catch (error) {
        decrypted = null;
      }
    }

    if (decrypted === null) {
      throw (0, _i18n.getI18nMessage)('crypto.aesError');
    }

    return decrypted.toString('utf8');
  }
};
var _default = Crypto;
exports["default"] = _default;