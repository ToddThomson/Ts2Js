import { Greeter } from "./GreeterModule"

export class Main {
    public Hello() {
        let greeter = new Greeter();
        console.log( greeter.SayHello() );
    }
}