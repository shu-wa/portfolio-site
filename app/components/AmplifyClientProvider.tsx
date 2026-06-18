"use client";

import { Amplify } from "aws-amplify";
import type { ReactNode } from "react";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

type AmplifyClientProviderProps = {
  children: ReactNode;
};

export default function AmplifyClientProvider({
  children,
}: AmplifyClientProviderProps) {
  return <>{children}</>;
}