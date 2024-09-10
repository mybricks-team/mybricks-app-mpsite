import React, { useState } from 'react';
import css from './index.less';
interface Props {
  value: string;
  textAlign?: string;
  maxWidth?: string;
  onBlur: (text: string) => void;
  onChange: (text: any) => void;
}

function EditableDiv({ value, textAlign = "left", maxWidth = "110" , onBlur, onChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onChange(newValue); 
  }

  return (
    <div
      className={css.input}
      onClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isEditing ? (
        <input
          className={css.inputEditing}
          style={{
            textAlign: textAlign,
            width:maxWidth + "px"
          }}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => {
            setIsEditing(false);
            onBlur(inputValue);
          }}
          autoFocus
        />
      ) : (
        <div className={css.inputDisplay} style={{maxWidth:maxWidth + "px"}}>{value}</div>
      )}
      {/* {isHovering && !isEditing && (
        <img
          src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-95eb0eaa-9033-4ead-9c01-dc41137c8e97.png"
          className={css.btn}
          onClick={() => setIsEditing(true)}
        />
      )} */}
    </div>
  );
}


export default EditableDiv;
