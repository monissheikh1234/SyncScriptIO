export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  cpp: "10.2.0"
};

export const CODE_SNIPPETS = {
  javascript: `
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("Alex");
`,
  python: `
def greet(name):
    print("Hello, " + name + "!")

greet("Alex")
`,
  java: `
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`,
  cpp: `
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Alex!" << endl;
    return 0;
}
`
};