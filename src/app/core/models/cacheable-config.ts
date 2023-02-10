import { Subject } from "rxjs";

export interface ICacheableConfig {
    refresher?: Subject<boolean>,
    logoutEvent?: Subject<boolean>
}