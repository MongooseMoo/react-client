# MSDP over GMCP

Source: [Mudhalla](https://tintin.mudhalla.net/protocols/gmcp/)

Wrapping MSDP was one of the first applications of GMCP.

MSDP provides the client with a list of supported variables when requested, so it's not a requirement for MUD servers to provide documentation on the packages it supports.

MSDP over GMCP allows the client to choose between using either MSDP, GMCP, or both. In the case a client enables both MSDP and GMCP the client is expected to be able to process both MSDP and GMCP data interchangably, similarly the server is expected to process both MSDP and GMCP data interchangably, as is the case in MTH 1.5.

Keep in mind that JSON does not allow sending control-codes while MSDP does. This is automatically handled in MTH 1.5.

As things currently stand MSDP over GMCP is primarily used for client to client communication by TinTin++, offering scripters a more readable alternative to MSDP, with a minimal implementation and maintenance burden. MSDP over GMCP might also be useful for inter-mud standards.

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgMTYgMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTguODkzIDEuNWMtLjE4My0uMzEtLjUyLS41LS44ODctLjVzLS43MDMuMTktLjg4Ni41TC4xMzggMTMuNDk5YS45OC45OCAwIDAgMCAwIDEuMDAxYy4xOTMuMzEuNTMuNTAxLjg4Ni41MDFoMTMuOTY0Yy4zNjcgMCAuNzA0LS4xOS44NzctLjVhMS4wMyAxLjAzIDAgMCAwIC4wMS0xLjAwMkw4Ljg5MyAxLjV6bS4xMzMgMTEuNDk3SDYuOTg3di0yLjAwM2gyLjAzOXYyLjAwM3ptMC0zLjAwNEg2Ljk4N1Y1Ljk4N2gyLjAzOXY0LjAwNnoiIC8+PC9zdmc+)warning

When using MSDP over GMCP the package name is considered case sensitive and MSDP must be fully capitalized. There are no subpackages as these are not necessary.

Link: [The MSDP Protocol Definition](/mud/msdp)


