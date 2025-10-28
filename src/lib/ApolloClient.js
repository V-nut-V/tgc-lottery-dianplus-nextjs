// lib/ApolloClient.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_BASE_URL + "/graphql", // <-- Replace with real URL
    fetchOptions: {
      // Optional fetch settings
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
