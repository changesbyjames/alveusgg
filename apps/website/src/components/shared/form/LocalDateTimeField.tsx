import {
  type ChangeEvent,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { type AriaFieldProps, useField } from "react-aria";

import { classes } from "@/utils/classes";

import IconX from "@/icons/IconX";

type DateTimeFieldProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  AriaFieldProps & {
    children?: ReactNode;
    label: string;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
    showResetButton?: boolean;
  };

export function LocalDateTimeField(props: DateTimeFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const { labelProps, fieldProps } = useField(props);
  const [showResetButton, setShowResetButton] = useState(
    () => props.showResetButton && Boolean(props.value || props.defaultValue),
  );
  const onChange = useMemo(
    () => (e: ChangeEvent<HTMLInputElement>) => {
      if (props.showResetButton) {
        setShowResetButton(Boolean(e.currentTarget.value));
      }

      if (props.onChange) {
        props.onChange(e);
      }
    },
    [props],
  );
  const reset = useCallback(() => {
    if (ref.current) {
      ref.current.value = "";
      setShowResetButton(false);
    }
  }, []);

  return (
    <div className={classes("flex-1", props.className)}>
      <label className={props.labelClassName} {...labelProps}>
        {props.label}
      </label>
      <div className="flex w-full items-center gap-1 rounded-xs border border-gray-700 bg-white text-gray-500">
        {props.prefix}
        <input
          ref={ref}
          type="datetime-local"
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
          className={classes(
            "w-full bg-white p-1 text-black",
            props.inputClassName,
          )}
          {...fieldProps}
          defaultValue={props.defaultValue}
          name={props.name}
          value={props.value}
          onChange={onChange}
        />
        {showResetButton && (
          <button className="px-2" type="button" onClick={reset}>
            <IconX className="size-4" />
          </button>
        )}
        {props.suffix}
      </div>
    </div>
  );
}
