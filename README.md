# tape-recorder

♫♪ |̲̅̅●̲̅̅|̲̅̅=̲̅̅|̲̅̅●̲̅̅| ♫♪
Thin ORM for CouchDB on top of Nano

---

## installation

1. install [npm](http://npmjs.org)
2. `npm install tape-recorder`

    import recorder from "tape-recorder";

    let UserSchema = new recorder.Schema({
      firstName: String,
      lastName: String,
      birthDate: { type: Date, default: Date.now }
    });

    UserSchema
        .method("age", () => {
            let now = new Date().getFullYear();
            return now - new Date(this.birthDate).getFullYear();
        })
        .virtual("fullName",
            () => { return `${this.firstName} ${this.lastName}`; },
            (value) => { [this.firstName, this.lastName] = value.split(" "); }
        );

    let User = recorder.model("User", UserSchema);

    let me = new User({
      firstName: "Benoit",
      lastName: "Charbonnier",
      birthDate: new Date("1980/09/06")
    });

    me.save((error, savedMe) => {
      console.log(`Hello, I am ${savedMe.fullname}, and I'm ${savedMe.age()} years old`);
    })



copyright 2015 Benoit Charbonnier

licensed under the apache license, version 2.0 (the "license");
you may not use this file except in compliance with the license.
you may obtain a copy of the license at

    http://www.apache.org/licenses/LICENSE-2.0.html

unless required by applicable law or agreed to in writing, software
distributed under the license is distributed on an "as is" basis,
without warranties or conditions of any kind, either express or implied.
see the license for the specific language governing permissions and
limitations under the license.
