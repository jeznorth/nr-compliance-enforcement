
import { FC } from "react";

interface ValidationTextAreaProps {
    className: string,
    defaultValue: string,
    id: string,
    onChange: Function,
    errMsg: string,
    rows: number,
  }

  export const ValidationTextArea: FC<ValidationTextAreaProps> = ({
    className,
    defaultValue,
    id,
    onChange,
    errMsg,
    rows,
  }) => {
    const errClass = (errMsg === "" ? "" : "error-message");
    const calulatedClass = (errMsg === "" ? className : className + " error-border");
    return (<div className="width-full">
        <div>
        <textarea
                    id={id}
                    className={calulatedClass}
                    defaultValue={defaultValue}
                    rows={rows}
                    onChange={e => onChange(e.target.value)}
                  />
        </div>
        <div className={errClass}>
            {errMsg}
        </div>
    </div>)
  };