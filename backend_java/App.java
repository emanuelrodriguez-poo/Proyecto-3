import static spark.Spark.*;

public class App {

public static void main(String[] args){

port(8080);

get("/info",(req,res)->{

res.type("application/json");

return "{"
+"\"nombre\":\"Fontibón\","
+"\"area\":\"33.3 km2\","
+"\"codigo\":\"9\","
+"\"wiki\":\"https://es.wikipedia.org/wiki/Fontibón\""
+"}";

});

}

}