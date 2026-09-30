# Common Parent

Maven parent for Ticket Flow Java modules. It centralizes:

- Java and Spring Boot versions
- Shared dependency versions (Lombok, Springdoc, Keycloak and Flowable)
- Maven compiler and Spring Boot plugin configuration

This module has `pom` packaging, contains no application source code and does not aggregate other modules.
Consumers resolve it from the local Maven repository or the configured remote repository.
