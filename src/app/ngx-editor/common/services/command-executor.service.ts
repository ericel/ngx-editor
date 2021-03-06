import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { MessageService } from './message.service';
import * as Utils from '../utils/ngx-editor.utils';
import { map, tap, last, catchError } from 'rxjs/operators';

@Injectable()
export class CommandExecutorService {

  savedSelection: any = undefined;

  constructor(private _http: HttpClient, private _messageService: MessageService) { }

  /**
   * executes command from the toolbar
   *
   * @param command command to be executed
   */
  execute(command: string): void {

    if (command === 'enableObjectResizing') {
      document.execCommand('enableObjectResizing', true, true);
      return;
    }

    if (command === 'blockquote') {
      document.execCommand('formatBlock', false, '<blockquote>');
      return;
    }

    if (command === 'removeBlockquote') {
      document.execCommand('formatBlock', false, 'div');
      return;
    }

    document.execCommand(command, false, null);
  }

  insertImage(imageURI: string): void {
    if (this.savedSelection) {
      if (imageURI) {
        const restored = Utils.restoreSelection(this.savedSelection);
        if (restored) {
          const inserted = document.execCommand('insertImage', false, imageURI);
          if (!inserted) {
            throw new Error('Invalid URL');
          }
        }
      }
    } else {
      throw new Error('Range out of the editor');
    }
    return;
  }

  uploadImage(file: File, endPoint: string): any {

    if (!endPoint) {
      throw new Error('Image Endpoint isn`t provided or invalid');
    }

    const formData: FormData = new FormData();

    if (file) {

      formData.append('file', file);

      const req = new HttpRequest('POST', endPoint, formData, {
        reportProgress: true
      });

      return this._http.request(req);

    } else {
      throw new Error('Invalid Image');
    }
  }

  createLink(params: any): void {

    if (this.savedSelection) {
      /**
       * check whether the saved selection contains a range or plain selection
       */
      if (params.urlNewTab) {
        const newUrl = '<a href="' + params.urlLink + '" target="_blank">' + params.urlText + '</a>';

        if (document.getSelection().type !== 'Range') {
          const restored = Utils.restoreSelection(this.savedSelection);
          if (restored) {
            document.execCommand('insertHTML', false, newUrl);
          }
          document.execCommand('insertHTML', false, newUrl);
        } else {
          throw new Error('Only new links can be inserted. You cannot edit URL`s');
        }
      } else {
        const restored = Utils.restoreSelection(this.savedSelection);
        if (restored) {
          document.execCommand('createLink', false, params.urlLink);
        }
      }
    } else {
      throw new Error('Range out of the editor');
    }

    return;
  }

}
