declare module 'passport-google-oauth20' {
  import { Strategy as PassportStrategy } from 'passport';
  export interface Profile {
    id: string;
    displayName?: string;
    emails?: { value: string }[];
    photos?: { value: string }[];
    [key: string]: any;
  }
  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL?: string;
    scope?: string[];
    [key: string]: any;
  }
  export type VerifyCallback = (error: any, user?: any, info?: any) => void;
  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify?: any);
  }
  export default Strategy;
}
