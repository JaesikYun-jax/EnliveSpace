/* ---------------------------------------------------------------------------
 * secret-gate.js — 링크 + 비밀번호를 아는 사람만 보는 "비공개 포트폴리오" 게이트
 *
 * 동작
 *   <body data-secret-hash="<sha256(비밀번호) hex>"> 를 읽어,
 *   입력값의 SHA-256 이 같으면 #secret-content 를 열어준다.
 *   통과 기록은 sessionStorage 에 저장 → 같은 탭 안에서 비공개 페이지들을
 *   오갈 때 다시 묻지 않는다. (탭을 닫으면 다시 잠김)
 *
 * 한계 (반드시 알고 쓸 것)
 *   정적 사이트라 검사는 전부 브라우저 안에서 일어난다. 비밀번호 원문은
 *   소스에 없지만(해시만 있음), 개발자 도구로 #secret-content 를 직접
 *   열어버리면 내용은 보인다. 즉 "우연히 들어온 사람 차단" 수준이며,
 *   절대 새면 안 되는 자료는 Cloudflare Access 같은 서버단 인증을 써야 한다.
 * ------------------------------------------------------------------------- */
(function () {
  'use strict';

  var body = document.body;
  var expected = (body.getAttribute('data-secret-hash') || '').toLowerCase();
  var content = document.getElementById('secret-content');
  var gate = document.getElementById('secret-gate');
  if (!expected || !content || !gate) return;

  var form = document.getElementById('secret-form');
  var input = document.getElementById('secret-password');
  var error = document.getElementById('secret-error');
  var STORE_KEY = 'es-secret:' + expected.slice(0, 16);

  function sha256Hex(text) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) return Promise.reject(new Error('no-subtle-crypto'));
    return subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  function unlock() {
    gate.hidden = true;
    content.hidden = false;
    body.classList.remove('secret-locked');
    document.dispatchEvent(new CustomEvent('secret:unlocked'));
  }

  function remembered() {
    try { return sessionStorage.getItem(STORE_KEY) === '1'; } catch (e) { return false; }
  }

  function remember() {
    try { sessionStorage.setItem(STORE_KEY, '1'); } catch (e) { /* 사생활 보호 모드 등 */ }
  }

  function showError(message) {
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
  }

  if (remembered()) {
    unlock();
    return;
  }

  // 아직 잠김 — 게이트를 띄운다
  body.classList.add('secret-locked');
  gate.hidden = false;
  if (input) setTimeout(function () { input.focus(); }, 60);

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (error) error.hidden = true;
      var value = input ? input.value : '';
      if (!value) { showError('비밀번호를 입력해 주세요.'); return; }

      sha256Hex(value).then(function (hex) {
        if (hex === expected) {
          remember();
          unlock();
        } else {
          showError('비밀번호가 올바르지 않습니다.');
          if (input) { input.value = ''; input.focus(); }
        }
      }).catch(function () {
        showError('이 브라우저에서는 확인할 수 없습니다. 최신 브라우저에서 열어 주세요.');
      });
    });
  }
})();
