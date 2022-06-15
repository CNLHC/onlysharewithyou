# hi

页面 1: 上传/管理页面
页面 2: 分享页面

1. 上传 PDF, 获得 PDF Key
2. 新增分享，复制分享链接
3. 在线展示和 PDF 下载

https://host/pdfkey/sharekey/

API:

1. PostPDF(file)->key
2. CreateShare(ShareCtx,file)->share_key
3. InvalidShare(share_key)->key
4. ListShare(key)

Storage:

raw_files:
(raw_file_id,uk,file)

shares:
(share_id,uk,raw_file_id,watered_file)

access_log:
(log_id,share_id,access_context);
