# @minni-im/tape-recorder

> a tiny couchdb orm

**_why?_**

Manipulating Documents and Models classes instead of raw `fetch` is sometimes better.

## Install

```
$ npm install --save @minni-im/tape-recorder
```

## Usage

**_Basic usage_**

```js
import { RecorderClient } from "@minni-im/tape-recorder";

const recorder = new RecorderClient({
	url: "http://localhost:5984",
	db: "<dbName>",
});
```

## Authentication

To connect using authentication, you can provide credentials to the configuration object.

```js
import { RecorderClient } from "@minni-im/tape-recorder";

const recorder = new RecorderClient({
	url: "http:.//localhost:5984",
	db: "<dbName>",
	credentials: {
		username: process.env.COUCH_USER,
		password: process.env.COUCH_PASSWORD,
	},
});
```

## license

copyright 2022 Benoit Charbonnier

licensed under the apache license, version 2.0 (the "license"); you may not use this file except in compliance with the license. you may obtain a copy of the license at

http://www.apache.org/licenses/LICENSE-2.0.html
unless required by applicable law or agreed to in writing, software distributed under the license is distributed on an "as is" basis, without warranties or conditions of any kind, either express or implied. see the license for the specific language governing permissions and limitations under the license.
