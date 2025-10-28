// Temparary Include History in Store Context Provider, might need create History Context provider in the future based on the amount of needs
"use client";
import { useState, useEffect, createContext } from "react";
import { gql } from "@apollo/client";
import client from "./ApolloClient";

export const StoreContext = createContext();

const initialStoreState = {
  documentId: 0,
  Store_ID: 0,
  Check_PIN: 0,
  Store_Name: "请输入门店ID",
  Background_URL: "",
  Prize: [],
  Dashboard_Title: "",
  Min_Spent: "",
  Position: "",
};

const StoreContextProvider = ({ children }) => {
  const [store, setStore] = useState(initialStoreState);

  useEffect(() => {
    const store_id = localStorage.getItem("store_id");
    if (store_id) getStore(parseInt(store_id));
  }, []);

  const getStore = async (id) => {
    const {
      data: {
        stores: [data],
      },
    } = await client.query({
      query: gql`
        query GetStore(
          $filters: StoreFiltersInput
          $pagination: PaginationArg
        ) {
          stores(filters: $filters) {
            documentId
            Store_ID
            Check_PIN
            Store_Name
            Dashboard_Title
            Min_Spent
            Background_URL
            Position
            Prize(pagination: $pagination) {
              Name
              Quantity
            }
          }
        }
      `,
      variables: {
        filters: {
          Store_ID: {
            eq: parseInt(id),
          },
        },
        pagination: {
          limit: 999,
        },
      },
      fetchPolicy: "network-only", // 添加这一行，强制从网络获取
    });
    if (!data) return undefined;
    setStore({
      documentId: data.documentId,
      Store_ID: data.Store_ID,
      Check_PIN: data.Check_PIN,
      Store_Name: data.Store_Name,
      Background_URL: data.Background_URL,
      Prize: data.Prize,
      Dashboard_Title: data.Dashboard_Title,
      Min_Spent: data.Min_Spent,
      Position: data.Position
    });
    localStorage.setItem("store_id", data.Store_ID);
    console.log("Store Data:===", data);
    return data;
  };

  const updateStore = async (store) => {
    const { data } = await client.mutate({
      mutation: gql`
        mutation UpdateStore($documentId: ID!, $data: StoreInput!) {
          updateStore(documentId: $documentId, data: $data) {
            documentId
            Store_ID
            Check_PIN
            Store_Name
            Dashboard_Title
            Min_Spent
            Background_URL
            Position
            Prize {
              Name
              Quantity
            }
          }
        }
      `,
      variables: {
        documentId: store.documentId,
        data: {
          Prize: store.Prize
        },
      },
    });
    setStore(data.updateStore);
  };

  const getHistory = async (invoiceNumber) => {
    const { data } = await client.query({
      query: gql`
        query GetHistorie(
          $filters: HistoryFiltersInput
          $pagination: PaginationArg
          $sort: [String]
        ) {
          histories(filters: $filters, pagination: $pagination, sort: $sort) {
            Code
            Prize_Name
            Store_ID
            Store_Name
            createdAt
            Create_Date
            Spent
          }
        }
      `,
      variables: {
        filters: {
          Code: {
            eq: invoiceNumber,
          },
        },
        pagination: {
          limit: 100,
        },
        sort: "Create_Date",
      },
      fetchPolicy: "network-only", // 添加这一行，强制从网络获取
    });
    if (!data.histories || data.histories.length === 0) return undefined;
    return data.histories;
  }

  const postHistory = async (history) => {
    const { data } = await client.mutate({
      mutation: gql`
        mutation PostHistory($data: HistoryInput!) {
          createHistory(data: $data) {
            Store_ID
            Store_Name
            Code
            Prize_Name
            Create_Date
            Spent
          }
        }
      `,
      variables: {
        data: history,
      },
    });
    return data.createHistory;
  }

  return (
    <StoreContext.Provider
      value={{
        store,
        setStore,
        getStore,
        updateStore,
        getHistory,
        postHistory,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
