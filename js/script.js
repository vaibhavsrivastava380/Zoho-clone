const leaves = [
  { tag:"holiday", name: "New Year's Day", date: "2026-01-01" },
  { tag:"holiday",  name: "Republic Day", date: "2026-01-26" },
  { tag:"holiday",  name: "Holi", date: "2026-03-14" },
  { tag:"holiday",  name: "Good Friday", date: "2026-04-03" },
  { tag:"holiday",  name: "Eid al-Fitr", date: "2026-04-21" },
  { tag:"holiday",  name: "Labour Day", date: "2026-05-01" },
  { tag:"holiday",  name: "Independence Day", date: "2026-08-15" },
  { tag:"holiday",  name: "Janmashtami", date: "2026-08-29" },
  { tag:"holiday",  name: "Gandhi Jayanti", date: "2026-10-02" },
  { tag:"holiday",  name: "Dussehra", date: "2026-10-22" },
  { tag:"holiday",  name: "Diwali", date: "2026-11-10" },
  { tag:"holiday",  name: "Christmas", date: "2026-12-25" }
   
];


const upcomingDropdown = document.querySelector("");
upcomingDropdown.addEventListener("change",function(){
    const value = this.value;
    if(value == all){
        renderElement(all);
    }
    else if(value == leave){
        renderElement(leave);
    }
    else if(value == holiday){
        renderElement(holiday);
    }
})
const pastDropdown = document.querySelector("");
pastDropdown.addEventListener("change",function(){
    const value = this.value;
    if(value == all){
        renderElement(all);
    }
    else if(value == leave){
        renderElement(leave);
    }
    else if(value == holiday){
        renderElement(holiday);
    }
})
const show = document.querySelector("");
function renderElement(){
    show.innerHTML = '';

}