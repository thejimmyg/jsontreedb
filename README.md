# jsontreedb

## Install

```
npm install
npm start
```

## Data Model

The data model is JSON except that arrays are not allowed and that `null`
values get their associated keys (and any sub-keys) deleted as does an empty
object `{}`. This means it can also be serialised as YAML. Arrays get treated
as objects with their keys being the array index and the value being the value
at that index.

Keys are sorted based on their UTF encoding.

Internally, `booking/one/token` is serialised as `.booking.one.token.`. This
allows us to scan from `.booking.one.token.` to `.booking.one.token{` to get
all the child keys of that JSON path.


## Next

* Simplify the code so that a key of `''` doesn't need special treatment.
