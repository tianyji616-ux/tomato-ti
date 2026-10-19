(() => {
  const siteUrl = 'https://tianyji616-ux.github.io/tomato-ti/';
  let dialog, preview, message, download, activeUrl, generation = 0;
  const track = (name, params) => { try { window.tomatoTrack?.(name, params); } catch (_) {} };
  function setup() {
    if (dialog) return;
    const style = document.createElement('style');
    style.textContent = '.share-dialog{border:0;border-radius:22px;padding:20px;width:min(92vw,460px);max-height:90dvh;overflow:auto;background:#f5faff;color:#455d76}.share-dialog::backdrop{background:rgba(35,55,75,.65)}.share-preview[hidden]{display:none}.share-preview{display:block;width:100%;height:auto;border-radius:14px;margin:12px 0}.share-controls{display:flex;gap:10px;flex-wrap:wrap}.share-controls>*{text-align:center;text-decoration:none}.share-dialog h2{margin:8px 0;font-size:22px}.share-dialog p{font-size:14px}.share-close{float:right;border:0;background:transparent;color:#455d76;font:inherit;cursor:pointer;padding:8px}.copy-fallback{width:100%;font:inherit;padding:8px;margin-top:12px}';
    document.head.appendChild(style);
    dialog = document.createElement('dialog');
    dialog.className = 'share-dialog';
    dialog.setAttribute('aria-labelledby', 'shareTitle');
    dialog.innerHTML = '<button class="share-close" type="button" aria-label="关闭分享卡">关闭 ×</button><h2 id="shareTitle">我的番茄人格卡</h2><p>手机长按图片保存，再发给朋友或朋友圈。</p><p id="shareMessage" role="status">正在生成图片…</p><img class="share-preview" alt="我的番茄人格分享卡" hidden><div class="share-controls"><a class="btn btn-primary" hidden>下载图片</a><button class="btn btn-secondary" type="button">复制测试链接</button></div><input class="copy-fallback" readonly aria-label="测试链接，长按或选中复制" hidden>';
    document.body.appendChild(dialog);
    preview = dialog.querySelector('img'); message = dialog.querySelector('[role=status]'); download = dialog.querySelector('a');
    dialog.querySelector('.share-close').onclick = () => dialog.close();
    dialog.addEventListener('close', () => { if (dialog.open) return; generation++; preview.hidden = true; preview.removeAttribute('src'); if (activeUrl) URL.revokeObjectURL(activeUrl); activeUrl = null; });
    dialog.querySelector('.btn-secondary').onclick = async () => {
      const input = dialog.querySelector('input');
      try {
        if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(siteUrl);
        message.textContent = '测试链接已复制，可以粘贴给朋友。';
      } catch (_) {
        input.hidden = false; input.value = siteUrl; input.focus(); input.select(); input.setSelectionRange(0, siteUrl.length);
        message.textContent = '请长按或选中下方链接复制。';
      }
      track('share_link_copy');
    };
  }
  function wrap(ctx, text, x, y, width, lineHeight) {
    let line = '';
    for (const char of text) {
      if (ctx.measureText(line + char).width > width && line) { ctx.fillText(line, x, y); y += lineHeight; line = ''; }
      line += char;
    }
    if (line) ctx.fillText(line, x, y);
    return y + lineHeight;
  }
  window.openTomatoShareCard = async (persona, imagePath) => {
    if (!persona) return;
    setup();
    const token = ++generation;
    preview.hidden = true; download.hidden = true; dialog.querySelector('input').hidden = true;
    message.textContent = '正在生成图片…';
    if (!dialog.open) dialog.showModal();
    track('share_click', { persona_id: persona.id });
    try {
      const image = new Image(); image.src = imagePath;
      await image.decode();
      if (token !== generation) return;
      const canvas = document.createElement('canvas'); canvas.width = 750; canvas.height = 1400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#eaf4ff'; ctx.fillRect(0, 0, 750, 1400);
      ctx.fillStyle = '#fffdfb'; ctx.fillRect(28, 28, 694, 1344);
      ctx.fillStyle = '#54769a'; ctx.textAlign = 'center'; ctx.font = 'bold 26px system-ui'; ctx.fillText('番茄TI · 你是什么番？', 375, 88);
      ctx.font = '20px system-ui'; ctx.fillText('TYPE ' + persona.id, 375, 134);
      ctx.font = 'bold 36px system-ui'; let y = wrap(ctx, persona.name, 375, 192, 630, 48);
      ctx.font = '23px system-ui'; y = wrap(ctx, persona.tag, 375, y + 8, 630, 34);
      const size = 490, scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
      const imageTop = y + 12; ctx.drawImage(image, (750 - w) / 2, imageTop + (size - h) / 2, w, h); y = imageTop + size + 42;
      ctx.fillStyle = '#d66f6b'; ctx.font = 'bold 30px system-ui'; y = wrap(ctx, '「' + persona.quote + '」', 375, y, 620, 44);
      ctx.fillStyle = '#54769a'; ctx.font = '24px system-ui'; y = wrap(ctx, persona.keywords, 375, y + 18, 620, 36);
      ctx.font = '22px system-ui'; wrap(ctx, persona.summary, 375, y + 20, 610, 34);
      ctx.font = 'bold 26px system-ui'; ctx.fillText('你是哪颗番？来测测看', 375, 1250);
      ctx.font = '19px system-ui'; ctx.fillText(siteUrl, 375, 1295);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('image export failed');
      if (token !== generation) return;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
      activeUrl = URL.createObjectURL(blob); preview.src = activeUrl; preview.hidden = false;
      download.href = activeUrl; download.download = '番茄TI-' + persona.id + '.png'; download.hidden = false;
      message.textContent = '图片已生成。微信里可长按图片保存；也可以复制测试链接。';
      track('share_card_generated', { persona_id: persona.id });
    } catch (_) {
      if (token === generation) message.textContent = '图片暂时生成失败，请关闭后重试；也可以先复制测试链接。';
    }
  };
})();
