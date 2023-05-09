import { useEffect, useRef } from "react";
import bitrix from "./bitrixContext";
import { AllowedType, FormState, BitrixUser, Order, UserType } from "./types";

export function getDepartament(
  author: string
): Promise<{ ID: string; NAME: string } | undefined> {
  return new Promise((resolve, reject) => {
    bitrix.getUser(author).then((data) => {
      if (Array.isArray(data.result) && data["result"].length) {
        let user = data["result"].pop();
        if (
          Array.isArray(user["UF_DEPARTMENT"]) &&
          user["UF_DEPARTMENT"].length
        ) {
          bitrix.getDepartment(user["UF_DEPARTMENT"].pop()).then((data) => {
            if (Array.isArray(data.result) && data["result"].length) {
              resolve(data["result"].pop());
            } else {
              reject();
            }
          });
        }
      } else {
        reject();
      }
    });
  });
}

export function getPhoneNumber(author: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    bitrix.getUser(author).then((res) => {
      resolve(
        res.result[0].PERSONAL_MOBILE ??
          res.result[0].PERSONAL_PHONE ??
          undefined
      );
    });
  });
}

export function loadFromStorage(
  key: string,
  callback: () => void,
  setFunc: (value: any) => void
) {
  let data = localStorage.getItem(key);
  if (!data) {
    callback();
  } else {
    let json = JSON.parse(data);
    setFunc(json);
  }
}

export function options(type: AllowedType | undefined): FormState {
  let options: FormState = {};
  if (type) {
    let post = ["836", "838", "888", "890"];
    let postSend = ["838", "890"];
    let postUkr = ["888", "890"];
    options.isPost = post.includes(type);
    if (options.isPost) {
      options.isSend = postSend.includes(type);
      options.isUkr = postUkr.includes(type);
      options.isNp = !options.isUkr;
      options.isRecive = !options.isSend;
    } else {
      if (type == "840") {
        options.isPeople = true;
      }
      if (type == "842" || type == "844") {
        options.isCargo = true;
      }
    }
  }
  return options;
}

export function getRight(userId: string, order: Order): UserType {
  if (userId == order.author && userId == order.driver) return "ownerexecutor";
  if (userId == order.author) return "owner";
  if (userId == order.driver) return "executor";
  return "user";
}

export function formatDate(date: Date): string {
  return date
    .toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    .replace(",", "");
}

export function getFileName(url: string): string {
  return url.substring(url.indexOf("]") + 1, url.lastIndexOf("["));
}

export function getFilePath(url: string): string {
  return url.substring(url.indexOf("=") + 1, url.lastIndexOf("["));
}

export function file2Base64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      resolve(reader.result?.toString().split(",").pop() || "");
    reader.onerror = (error) => reject(error);
  });
}

export function formatDateString(date: string): string {
  return formatDate(new Date(date));
}

export async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

export function openInNewTab(href: string) {
  Object.assign(document.createElement("a"), {
    target: "_blank",
    rel: "noopener noreferrer",
    href,
  }).click();
}

export function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}
