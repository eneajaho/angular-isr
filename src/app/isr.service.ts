import { DOCUMENT, isPlatformServer } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { ChildActivationEnd, Router } from "@angular/router";
import { filter, map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class ISRService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    @Inject(DOCUMENT) private doc: Document
    // @Optional() @Inject('ssrRequest') private request?: Request
  ) {
    if (isPlatformServer(this.platformId)) {
      this.activate();
      // console.log(request)
    } else {
      console.log('Test')
    }
  }

  activate(): void {
    this.router.events
      .pipe(
        filter((e) => e instanceof ChildActivationEnd),
        map((event) => {
          let snapshot = (event as ChildActivationEnd).snapshot;
          while (snapshot.firstChild !== null) {
            snapshot = snapshot.firstChild;
          }
          return snapshot.data;
        }),
      )
      .subscribe((data: any) => {
        if(data?.[ "revalidate" ] !== undefined) {
          this.addISRDataToBody(data);
        }
      });
  }

  private addISRDataToBody({ revalidate }: { revalidate: number }): void {
    const script = this.doc.createElement('script');
    script.id = 'isr-state';
    script.setAttribute('type', 'application/json');
    script.textContent = JSON.stringify({ revalidate });
    this.doc.body.appendChild(script);
  }
}