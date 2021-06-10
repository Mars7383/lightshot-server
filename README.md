# Lightshot to pays.host Bridge
Lightshot doesn't provide a way to use pays.host, but we can override the hosts file to intercept the screenshot and upload it ourselves.

This program uses some bad workarounds to prevent dupe uploads, read below
<details>
  <summary> ^ More info on that</summary>
  
  ### Lightshot thumbnail files
  Lightshot likes to make 180x180 "thumbnail" files along with your screenshot, so this program just blocks images with a resolution of 180x180. 
  
  Additionally, this program blocks JPG files from being uploaded since only thumbnails use those. If you need to upload JPG files for whatever reason, you can remove that one-liner from the ``index.js`` file, but you may experience duplicate uploads to pays.host

  ### Dupe files
  If your screenshot resolution is smaller than 180x180, the generated thumbnail file is just a duplicate of your screenshot. So this program blocks a file from uploading if it's hash matches that of the previous file.
</details>

***

## Why
macOS and Linux don't have ShareX, and some of the alternatives are kinda bad

## Server Configuration

Grab required modules with ``npm i fs express express-fileupload uid image-size node-fetch form-data crypto``

In ``config.json``:
```
listenPort => Port to listen to (80 is recommended)
uploadDir => Where to temporarily store screenshots (they will be deleted after uploading to pays.host)
key => Your pays.host key
```
## Client Configuration

Please note that this server might not work on the latest Lightshot because of an update. Downgrade to an older version of Ligthshot if you're unable to upload images.

Add a line to your hosts file to point ``upload.prntscr.com`` to your server machine (example: ``127.0.0.1 upload.prntscr.com``)

The hosts file can be found at:

macOS/Linux: ``/etc/hosts``

Windows: ``C:\Windows\System32\drivers\etc\hosts``

***

This is a fork of [indilo53's Private LightShot Server](https://github.com/indilo53/lightshot-server) 
