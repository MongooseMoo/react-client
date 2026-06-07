# The `ms.resources` package

## Resources

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMTQgMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTYuMyA1LjY5YS45NDIuOTQyIDAgMCAxLS4yOC0uN2MwLS4yOC4wOS0uNTIuMjgtLjcuMTktLjE4LjQyLS4yOC43LS4yOC4yOCAwIC41Mi4wOS43LjI4LjE4LjE5LjI4LjQyLjI4LjcgMCAuMjgtLjA5LjUyLS4yOC43YTEgMSAwIDAgMS0uNy4zYy0uMjggMC0uNTItLjExLS43LS4zek04IDcuOTljLS4wMi0uMjUtLjExLS40OC0uMzEtLjY5LS4yLS4xOS0uNDItLjMtLjY5LS4zMUg2Yy0uMjcuMDItLjQ4LjEzLS42OS4zMS0uMi4yLS4zLjQ0LS4zMS42OWgxdjNjLjAyLjI3LjExLjUuMzEuNjkuMi4yLjQyLjMxLjY5LjMxaDFjLjI3IDAgLjQ4LS4xMS42OS0uMzEuMi0uMTkuMy0uNDIuMzEtLjY5SDhWNy45OHYuMDF6TTcgMi4zYy0zLjE0IDAtNS43IDIuNTQtNS43IDUuNjggMCAzLjE0IDIuNTYgNS43IDUuNyA1LjdzNS43LTIuNTUgNS43LTUuN2MwLTMuMTUtMi41Ni01LjY5LTUuNy01LjY5di4wMXpNNyAuOThjMy44NiAwIDcgMy4xNCA3IDdzLTMuMTQgNy03IDctNy0zLjEyLTctNyAzLjE0LTcgNy03eiIgLz48L3N2Zz4=)note

This duplicates parts of the `ms.char` package, but places it under the `ms.resources` namespace to allow usage for non-character related resources as well. A decision which one is the better approach is pending.

The term "resources" refers to fast changing energies like Health or Mana.

### ms.resources.definitions

Sent by the server to inform the client of all resources tracked on the MUD. The server may send more resources as those that apply to the character, e.g. because class specific resources exist.

``` json
ms.resources.definitions {
    {
      "id": "hp",
       "label": "Hit Points",
        "abbrev": "HP",
       "color": "FF0000"
  },  {
        "id": "mana",
        "label": "Mana",
        "abbrev": "Ma",
        "color": "0000FF"
    }
}
```

- **id** (*Mandatory*) This identifier is used to refer to this resource when sending updates. It should consist of ASCII letters only.
- **label** (*Mandatory*) A human readable name
- **abbrev** (*Optional*, but recommended) A 2 or 3 letter name for this resource, that can be used in tables, healthbars ...
- **color** (*Optional*) Hexadecimal RGB code of a color to use for this resource

### ms.resources.update

This command is sent from the server to the client to inform of the current state of the characters resources. Servers may send this in a fixed interval or only when resources are changing

``` json
ms.resources.update {
    {
       "id": "hp",
       "current": "15",
      "max": "20",
      "tempmax": "24"
    },  {
        "id": "mana",
        "current": "16",
        "max": "22",
        "blocked": "4"
    }
}
```

- **id**

  (*Mandatory*) Refers to the resource for which these stats are valid

- **current**

  (*Mandatory*) The current value of the resource. Usually numerical

- **max**

  (Mandatory) The maximum value of the resource

- **tempmax**

  (*Optional*) If the maximum value is temporary modified , this is the current maximum.

- **blocked**

  (*Optional*) Some game systems assign/block fractions of a resource while sustaining an effect. This value can be used to describe this.


