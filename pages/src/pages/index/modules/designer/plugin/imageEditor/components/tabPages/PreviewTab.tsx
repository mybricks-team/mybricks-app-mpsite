import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useObservable } from '@mybricks/rxui';
import type { MenuProps } from 'antd';
import { Button, message, Spin, Dropdown, Modal, Switch } from 'antd';
import css from './PreviewTab.less';
import { uploadFilesToCDN } from '../../service/uploadFilesToCDN';
import ModalFooter from '../modalFooter/index';
import Context from '../../context/index';

interface Props {
  value?: string;
  visible?: boolean;
  onOk: (value?: string) => void;
  onCancel: () => void;
}

export const PreviewTab = ({ value, onOk, onCancel }: Props) => {
  const { url, setUrl } = useContext(Context);
  const [picUrl, setPicUrl] = useState('');
  const [picUrlRes, setPicUrlRes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enableCompress, setEnableCompress] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const model: any = useObservable({ value, showImageSelector: false, loading: false });
  const handleDragEnter = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    if (url !== picUrl) {
      setUrl(picUrl);
    }
  }, [picUrl]);

  useEffect(() => {
    if (picUrl !== url) {
      setPicUrl(url);
    }
  }, [url]);

  const uploadImages = (files: any) => {
    model.loading = true;
    uploadFilesToCDN([...files], {
      allowHash: 'true',
      allowRewrite: 'true',
    })
      .then(async (res) => {
        model.loading = false;
        if (res && res.result === 1 && res.data.success) {
          const data = res.data.fileResults || [];
          const url: string = data.map((item: any) => item.cdnUrl.replace('ali2.a.kwimgs.com', 'f2.eckwai.com'))[0];
          const compressedUrl = await fetch('/v2/api/common/image/compressImageFromCDN', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: url,
            }),
          })
            .then((res) => res.json())
            .then((res) => res.data);

          if (url) {
            if (!enableCompress) {
              setPicUrl(url);
              // model.value = url;
            } else {
              // model.value = compressedUrl;
              setPicUrl(compressedUrl);
            }

            message.success(`上传成功，链接已复制到剪贴板`);
          } else {
            message.error(`上传失败，请稍后重试！${res.statusText}`);
          }
        } else {
          message.error(`上传失败，请稍后重试！${res.statusText}`);
        }
      })
      .catch((e) => {
        model.loading = false;
      });
  };

  const hanldeDrop = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    let files = e.dataTransfer.files;
    let acceptedFiles = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.match(/image/)) {
        acceptedFiles.push(files[i]);
      } else {
        message.warn('不允许上传该格式的文件,只能上传图片文件');
      }
    }
    uploadImages(acceptedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const hanldeClick = () => {
    console.log('click', inputRef.current);
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    console.log('files', files);
    uploadImages(files);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    console.log('handleOk', picUrlRes);
    setPicUrl(picUrlRes);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {picUrl != '' && (
        <>
          <div className={css.imageSelector}>
            <div className={css.localContainer}>
              <div className={css.top}>
                <div>图片地址：</div>
                {/* <Switch
                  checked={enableCompress}
                  onChange={(checked) => {
                    setEnableCompress(checked);
                  }}
                /> */}
                <input
                  className={css.input}
                  value={picUrl}
                  onChange={(e) => {
                    setPicUrl(e.target.value);
                  }}
                />
              </div>
              <div
                className={css.content}
                onDragEnter={handleDragEnter}
                onDrop={hanldeDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={hanldeClick}
                onMouseEnter={() => (model.showImageSelector = true)}
                onMouseLeave={() => (model.showImageSelector = false)}
              >
                <img style={{ height: '100%', objectFit: 'contain', maxWidth: '600px' }} src={picUrl} />
                <div className={css.chooseImage} style={{ opacity: model.showImageSelector || model.loading ? 1 : 0 }}>
                  {model.loading ? <Spin /> : <button>将文件拖到此处，或点击上传</button>}
                </div>
                <input
                  ref={inputRef}
                  style={{ display: 'none' }}
                  type={'file'}
                  accept="image/gif, image/jpeg,image/jpg,image/png,image/svg"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <ModalFooter onConfirm={onOk} onCancel={onCancel}></ModalFooter>
        </>
      )}

      {picUrl == '' && (
        <>
          <div className={css.emptyBox}>
            <img className={css.emptyPic} src="https://f2.eckwai.com/kos/nlav11092/u_cm8y1z.7f62b3d5daf141a4.svg" />
            <div className={css.emptyText}>暂无图片，请先上传图片</div>
            <div className={css.emptyButton}>
              <Button className={css.emptyButtonA} type="primary" onClick={() => hanldeClick()}>
                本地上传图片{' '}
                <input
                  ref={inputRef}
                  style={{ display: 'none' }}
                  type={'file'}
                  accept="image/gif, image/jpeg,image/jpg,image/png,image/svg"
                  onChange={handleChange}
                />
              </Button>
              <Button
                className={css.emptyButtonB}
                onClick={() => {
                  showModal();
                }}
              >
                使用图片链接
              </Button>
            </div>
          </div>
          <Modal
            bodyStyle={{ height: '130px', padding: '10px 10px', overflow: 'hidden', boxShadow: 'none' }}
            title="输入图片链接"
            style={{ borderRadius: '10px', overflow: 'hidden', height: '180px' }}
            centered
            visible={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
            className={css.modal}
          >
            <input
              className={css.textInput}
              type="text"
              placeholder="在此输入/粘贴图片的链接"
              onChange={(e) => setPicUrlRes(e.target.value)}
            />
            <ModalFooter onConfirm={handleOk} onCancel={handleCancel}></ModalFooter>
          </Modal>
        </>
      )}
    </>
  );
};
