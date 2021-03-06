import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { Model } from '../model';
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private http : HttpClient) {
    this.apiURL = environment.apiURL + "/api/values";
  }

  readonly apiURL : string;
  file: string = "";
  password: string = "";
  filename: string = "";
  file2: string = "";
  password2: string = "";
  filename2: string = "";

  getFile(e: any, type: any) {
    if (e.target.files.length > 0) {
      const reader = new FileReader();
      const file = e.target.files[0];

      this.convertFiletoBase64(reader, file)
          .subscribe(base64 => {
            if (type === 0) {
              this.file = base64;
              this.filename = file.name;
            }
            else {
              this.file2 = base64;
              this.filename2 = file.name;
            }
          });

      e.target.value = "";
    }
    else alert('Adicione um arquivo');
  }

  encrypt() {
    let form = new FormData();
    if (this.file.length === 0 || this.password.length === 0)
    {
      alert('Adicione o arquivo e coloque uma senha!');
      return;
    }

    form.append('file', this.file);
    form.append('password', this.password);

    this.http.post<Model>(
      this.apiURL + "/encrypt",
      form
    ).subscribe(res => {
      if (res.base64.length > 0) 
      {
        let data = this.convertBase64toBlob(res.base64);
        this.download(data, 'encrypted_file');
      }
      else
        alert('Falha ao criptografar arquivo!');
    });

    this.clear();
  }

  decrypt() {
    let form = new FormData();
    
    if (this.file2.length === 0 || this.password2.length === 0)
    {
      alert('Adicione o arquivo e coloque uma senha!');
      return;
    }

    form.append('file', this.file2);
    form.append('password', this.password2);

    this.http.post<Model>(
      this.apiURL + "/decrypt",
      form
    ).subscribe(res => {
      if (res.base64.length > 0) 
      {
        let data = this.convertBase64toBlob(res.base64);
        this.download(data, 'decrypted_file');
      }
      else
        alert('Falha ao descriptografar arquivo!');
    });

    this.clear();
  }

  addFile(type: any) {
    let el;

    if (type === 0)
      el = document.getElementById('file');
    else
      el = document.getElementById('file2');

    if (el != null)
      el.click();
  }

  clear() {
    this.file = "";
    this.password = "";
    this.file2 = "";
    this.password2 = "";
    this.filename = "";
    this.filename2 = "";
  }

  convertFiletoBase64(reader : FileReader, file : File) : Observable<string>
  {
    reader.readAsDataURL(file);
    return fromEvent(reader, 'load').pipe(pluck('currentTarget', 'result'));
  }

  convertBase64toBlob(data: string, size = 512)
  {
    const byteCharacters = atob(data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += size) {
      const slice = byteCharacters.slice(offset, offset + size);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'application/pdf' });
    return blob;
  }

  download(data: Blob, filename: string)
  {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(data, filename);
    } else {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filename;
      link.click();
    }
  }
}
