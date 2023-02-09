import { Subject } from "rxjs";

export interface ICacheableConfig {
    refresher?: Subject<boolean>
}