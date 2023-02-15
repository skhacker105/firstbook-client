import { Subject } from "rxjs";

export interface ICacheableConfig {
    name?: string,
    refresher?: Subject<boolean>,
    logoutEvent?: Subject<boolean>
}