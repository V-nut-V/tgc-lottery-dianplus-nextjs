"use client";
import styled from "styled-components";

export const LotteryContainer = styled.div`
  ${({ position }) => {
    if (position === "bottom") {
      return `
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding-top: 40vh;
      `;
    } else if (position === "right") {
      return `
        display: grid;
        grid-template-columns: 2fr 3fr;
        gap: 4rem;
        padding: 5rem;
        padding-top: 18vh;
      `;
    } else if (position === "left") {
      return `
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 4rem;
        padding: 5rem;
        padding-top: 18vh;
        `;
    } else {
      return `
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      `;
    }
  }}
  height: 100%;
  min-height: 100vh;
  ${({ background_url }) =>
    background_url ? `background-image: url("${background_url}");` : ""}
  background-position: center;
  background-size: cover;

  .box {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(0.6rem);
    -webkit-backdrop-filter: blur(1rem);
    padding: 2.5rem 5rem;
    padding-top: 4rem;
    border-radius: 3rem;
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1);
    text-align: center;
    position: relative;
    max-width: 60rem;
    width: 90%;
    z-index: 1;
    height: fit-content;
    border: 0.1rem solid rgba(255, 255, 255, 0.8);
    box-shadow: 0.3rem 0.3rem 0.6rem rgba(0, 0, 0, 0.25);

    ${({ position }) =>
      position === "right" &&
      `
        grid-column: 2/3;
        width: 100%;
        max-width: unset;
    `}

    ${({ position }) =>
      position === "left" &&
      `
        width: 100%;
        max-width: unset;
    `}
  }

  .rolling-box {
    display: block;
    text-align: center;
    min-height: 8rem;
    min-width: 10rem;
    line-height: 8rem;
    font-size: 2.8rem;
    font-weight: 600;
    background: #fff;
    margin: 2.5rem 0;
    margin-bottom: 1.5rem;
    border-radius: 50rem;
    transition: all 0.3s;
    box-shadow: 0.3rem 0.3rem 0.6rem rgba(0, 0, 0, 0.05);
  }

  span.times-limit {
    font-weight: 500;
    color: #333;
    text-shadow: 0.1rem 0.1rem 0.2rem rgba(0, 0, 0, 0.3);
  }

  ul.history-list {
    max-height: 4rem;
    overflow-y: scroll;
    margin-top: 0.5rem;
    scrollbar-color: rgba(255, 255, 255, 0.5) rgba(255, 255, 255, 0.05);
    scrollbar-width: thin;
    width: fit-content;
    margin: 0 auto;
    padding: 0 1rem;
    color: #333;
    text-shadow: 0.1rem 0.1rem 0.2rem rgba(0, 0, 0, 0.3);
  }

  .icon-store-settings {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    background-color: rgba(140, 140, 140, 0.9);
    padding: 0.3rem;
    line-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
    color: #fff;
  }
`;
