import css from './index.less';
import { Button } from 'antd';
const index = ({ onConfirm }) => {
  return (
    <div className="fangzhou-theme">
      <div className={css.footer}>
        <div className={css.buttonBox}>
          <Button type="primary" className={css.confirm} onClick={onConfirm}>
            应用
          </Button>
        </div>
      </div>
    </div>
  );
};
export default index;
