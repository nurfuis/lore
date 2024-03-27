The lore library operates similarly to a blacksmith's workshop, but instead of crafting physical objects, we're working with data. Similar to how a blacksmith uses a horseshoe template to create various horseshoes, the lore library allows you to create templates that act as blueprints for your data entries. These template forms are filled with specific details relevant to the object type. For example, a horseshoe template might include properties like size, type, material, grade, value, and cost. Another template could be for a small knife, which could share many properties with the horseshoe template and potentially have a few additional ones.

The template maker allows users to leverage inheritance. This means they can create a new template by extending an existing one. This pre-fills all the properties from the base template into the new "maker form." Users can then add new fields, adjust existing ones, or remove them altogether. Finally, they can assign a new name to the derived template.

In the Editor, users can utilize the newly created "small knife" template to add entries. These entries could have variations in material, handle, length, market, and unique properties specific to the knife.

Similarly, a sword template could inherit properties from the "small knife" template while remaining a distinct category.  Extending the "small knife" template to create a "Short Sword" requires only two clicks in the template maker: selecting the base template and saving the new one with a unique name.

Lastly, the Lore Explorer functions as an expanding card viewer. It allows users to inspect individual entries and manage them by deleting entries or even entire templates that no longer have associated entries.


Future Updates:

The library is constantly evolving, so keep an eye out for these upcoming features (if you care):

Multiple Images: Because a single image just isn't enough for some folks. Include all the angles you want.

Data Catalog Export: Tired of manually transferring your data? We get it. Soon you'll be able to export your entire library as a handy zip file.

Audio & Animation Integration: Spice things up with some sound effects or short animations (assuming your game engine supports it).

Game Development Tools: Integration tools for game development are planned. These might (hopefully) save you some time wrangling your lore assets into your game.

Again, these features are on the horizon, but we can't guarantee an exact arrival date.

New electron project:
$ yarn create electron-app newProjectName --template=webpack 
$ cd newProjectName

Clone repo and setup:
$ yarn install
$ yarn add copy-webpack-plugin --save-dev
$ yarn start

To make distributeables:
$ npm install --save-dev @electron-forge/cli



