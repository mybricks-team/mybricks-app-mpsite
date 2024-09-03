import css from './index.less';
import { Button } from 'antd';
const index = ({ onConfirm, onCancel }) => {
  return (
    <div className="fangzhou-theme">
      <div className={css.footer}>
        <div className={css.buttonBox}>
          <Button
            className={css.cancel}
            onClick={onCancel}
          >
            取消
          </Button>
          <Button type="primary" className={css.confirm} onClick={onConfirm}>
            确定
          </Button>
        </div>
      </div>
    </div>
  );
};
export default index;
