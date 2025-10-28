"use client";
import styled from "styled-components";

export const StoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h3 {
    margin-bottom: 1.5rem;
  }

  span.note {
    display: inline-block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .store-info {
    display: flex;
    gap: 1rem;
  }

  .prize-title {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    margin-bottom: 0.5rem;

    h6 {
      margin: 0;
    }
  }


  .prize-list {
    display: grid;
    grid-template-columns: 6rem 1fr;
    border: 1px solid #888;
    border-radius: 1rem;
    max-height: 50vh;
    overflow-y: scroll;
    scrollbar-color: rgba(0, 0, 0, 0.5) rgba(255, 255, 255, 0.05);
    scrollbar-width: thin;

    span {
      padding: 1rem;
      border-bottom: 1px solid #888;

      &.title {
        position: sticky;
        top: 0;
        background: rgba(255, 255, 255, 0.55);
        backdrop-filter: blur(0.6rem);
        -webkit-backdrop-filter: blur(1rem);
      }

      &.quantity {
        text-align: right;
        border-right: 1px solid #888;

        &:last-child {
          border-bottom: 0;
        }
      }
    }
  }

  .min-spent {
    display: block;
    margin-top: 1rem;
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
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