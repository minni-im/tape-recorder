# tape-recorder

♫♪ |̲̅̅●̲̅̅|̲̅̅=̲̅̅|̲̅̅●̲̅̅| ♫♪
Thin ORM for CouchDB on top of Nano

---

## installation

1. install [npm](http://npmjs.org) (>= `v15`)
2. `npm install @minni-im/tape-recorder`

## usage

```javascript
import recorder from "@minni-im/tape-recorder";

const { defineSchema, registerModel } = recorder("http://localhost:5984", "myDb");

const UserSchema = defineSchema({
	firstName: String,
	lastName: String,
	birthDate: { type: Date, default: Date.now },
});

UserSchema.method("age", () => {
	let now = new Date().getFullYear();
	return now - new Date(this.birthDate).getFullYear();
}).virtual(
	"fullName",
	() => `${this.firstName} ${this.lastName}`,
	(value) => {
		[this.firstName, this.lastName] = value.split(" ");
	},
);

const User = registerModel("User", UserSchema);

const me = new User({
	firstName: "John",
	lastName: "Diggle",
	birthDate: new Date("1975/04/01"),
});

await me.save();

console.log(`Hello, I am ${me.fullname}, and I'm ${me.age()} years old`);
// Hello, I am John Diggle, and I am 40 years old
```

## license

copyright 2021 Benoit Charbonnier

licensed under the apache license, version 2.0 (the "license");
you may not use this file except in compliance with the license.
you may obtain a copy of the license at

    http://www.apache.org/licenses/LICENSE-2.0.html

unless required by applicable law or agreed to in writing, software
distributed under the license is distributed on an "as is" basis,
without warranties or conditions of any kind, either express or implied.
see the license for the specific language governing permissions and
limitations under the license.
